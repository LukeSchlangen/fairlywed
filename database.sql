-----------------------------------------------------------------------------------

------------------ DATABASE SET UP TO CREATE DATABASE FROM SCRATCH ----------------

-----------------------------------------------------------------------------------

CREATE EXTENSION postgis;

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name VARCHAR(200) NOT NULL,
	email VARCHAR(200) NOT NULL,
	firebase_user_id VARCHAR(500) UNIQUE NOT NULL,
	authentication_provider VARCHAR(500) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- CREATE TABLE logs (
-- 	id SERIAL PRIMARY KEY,
-- 	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
-- 	action VARCHAR(200) NOT NULL,
-- 	user_id INT NOT NULL REFERENCES users
-- );

CREATE TABLE stripe_accounts (
	id SERIAL PRIMARY KEY,
	creator_user_id INT NOT NULL REFERENCES users,
	stripe_user_id VARCHAR(100) NOT NULL,
	stripe_refresh_user_token  VARCHAR(100) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE vendors (
	id SERIAL PRIMARY KEY,
	name VARCHAR(500) NOT NULL,
    location_address VARCHAR(1000) NOT NULL, 
	location geography NOT NULL,
	travel_distance INT DEFAULT 16093 NOT NULL, -- Default to 10 mile radius, stored in meters
	stripe_account_id INT REFERENCES stripe_accounts,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE users_vendors (
	id SERIAL,
	user_id INT NOT NULL REFERENCES users,
	vendor_id INT NOT NULL REFERENCES vendors,
	stripe_connect_state VARCHAR(100) DEFAULT md5(random()::text) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	PRIMARY KEY(user_id, vendor_id)
);

CREATE TABLE vendor_invitations (
	id SERIAL,
	inviter_user_id INT NOT NULL REFERENCES users,
	vendor_id INT NOT NULL REFERENCES vendors,
	invitee_email VARCHAR(200),
	invitation_token VARCHAR(100) DEFAULT md5(random()::text) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	accepted_at TIMESTAMP,
	accepted_by_user_id INT REFERENCES users,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE subvendortypes (
	id SERIAL PRIMARY KEY,
	name VARCHAR(500) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE subvendors (
	id SERIAL PRIMARY KEY,
	name VARCHAR(500) UNIQUE NOT NULL,
    location_address VARCHAR(1000), -- if null, pull value from the parent, MVP doesn't have input fields for this
	location geography, -- if null, pull value from the parent, MVP doesn't have input fields for this
	travel_distance INT, -- if null, pull value from the parent, MVP doesn't have input fields for this
	description VARCHAR(2000),
	parent_vendor_id INT NOT NULL REFERENCES vendors,
	vendortype_id INT NOT NULL REFERENCES subvendortypes,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE packages(
	id SERIAL PRIMARY KEY,
	vendortype_id INT NOT NULL REFERENCES subvendortypes,
	name VARCHAR(500) UNIQUE NOT NULL,
	number_of_photographers BOOLEAN NOT NULL,
	number_of_hours BOOLEAN NOT NULL,
	engagement_session_is_included BOOLEAN NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE subvendors_packages (
	id SERIAL,
	subvendor_id INT NOT NULL REFERENCES subvendors,
	package_id INT NOT NULL REFERENCES packages,
	price INT CHECK (price > 100 AND price <100000),
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL,
	PRIMARY KEY(subvendor_id, package_id)
);

CREATE TABLE availability (
	id SERIAL PRIMARY KEY,
	status VARCHAR(500) NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE subvendor_availability (
	subvendor_id INT NOT NULL REFERENCES subvendors,
	day DATE NOT NULL,
    availability_id INT NOT NULL REFERENCES availability,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	PRIMARY KEY(subvendor_id, day)
);

CREATE TABLE stripe_charge_attempts (
	id SERIAL PRIMARY KEY,
	response_object TEXT NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	was_successful BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE bookings (
	id SERIAL PRIMARY KEY,
	package_id INT NOT NULL REFERENCES packages,
	subvendor_id INT NOT NULL REFERENCES subvendors,
	stripe_account_id INT NOT NULL,
	vendor_id INT NOT NULL,
	client_user_id INT NOT NULL,
	time TIMESTAMP NOT NULL,
	price INT NOT NULL,
	requests TEXT,
	location_name VARCHAR(1000) NOT NULL,
	location geography NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	stripe_charge_id INT REFERENCES stripe_charge_attempts
);

CREATE TABLE subvendor_images (
	id SERIAL PRIMARY KEY,
	original_name VARCHAR(500) NOT NULL,
	encoding VARCHAR(500) NOT NULL,
	mime_type VARCHAR(500) NOT NULL,
    subvendor_id INT NOT NULL REFERENCES subvendors,
	is_public BOOLEAN DEFAULT FALSE NOT NULL,
	is_in_gallery BOOLEAN DEFAULT FALSE NOT NULL,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL,
	is_active BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE subvendor_matchup (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users,
	winning_image INT NOT NULL REFERENCES subvendor_images,
	losing_image INT NOT NULL REFERENCES subvendor_images,
	created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- INSERTING NECESSARY DATABASE DATA (NEEDED FOR ALL ENVIRONMENTS)

-- INSERTING SUBVENDOR TYPES
INSERT INTO subvendortypes (name)
VALUES ('photographer'), ('videographer'), ('dj');

-- INSERTING PACKAGES
INSERT INTO packages (id, name, vendortype_id, number_of_photographers, number_of_hours, engagement_session_is_included)
VALUES (1, 'Two Photographers: 10 Hours', 1, 2, 10, TRUE),
(2, 'Two Photographers: 8 Hours', 1, 2, 8, TRUE),
(3, 'One Photographer: 10 Hours', 1, 1, 10, TRUE),
(4, 'One Photographer: 8 Hours', 1, 1, 8, TRUE),
(5, 'One Photographer: 6 Hours', 1, 1, 6, TRUE),
(6, 'One Photographer: 4 Hours', 1, 1, 4, TRUE),
(7, 'Two Photographers: 10 Hours - 1 hour Engagement Session Included', 1, 2, 10, TRUE),
(8, 'Two Photographers: 8 Hours - 1 hour Engagement Session Included', 1, 2, 8, TRUE),
(9, 'One Photographer: 10 Hours - 1 hour Engagement Session Included', 1, 1, 10, TRUE),
(10, 'One Photographer: 8 Hours - 1 hour Engagement Session Included', 1, 1, 8, TRUE),
(11, 'One Photographer: 6 Hours - 1 hour Engagement Session Included', 1, 1, 6, TRUE),
(12, 'One Photographer: 4 Hours - 1 hour Engagement Session Included', 1, 1, 4, TRUE),
(13, 'Two Photographers: 6 Hours', 1, 2, 6, TRUE),
(14, 'Two Photographers: 4 Hours', 1, 2, 4, TRUE),
(15, 'Two Photographers: 6 Hours - 1 hour Engagement Session Included', 1, 2, 6, TRUE),
(16, 'Two Photographers: 4 Hours - 1 hour Engagement Session Included', 1, 2, 4, TRUE);

-- CREATING AVAILABILITY STATUSES
INSERT INTO availability (status)
VALUES ('unavailable'), ('available'), ('booked');

-----------------------------------------------------------------------------------

--------------------------- MOCK DATA FOR LOCAL TESTING ---------------------------

-----------------------------------------------------------------------------------


-- INSERTING VENDORS
INSERT INTO vendors (name, location_address, location)
VALUES ('Big Time Minnetonka Wedding Vendor', 'Minnetonka, MN', CAST(ST_SetSRID(ST_Point(-93.4687, 44.9212),4326) As geography)),
('Edina Wedding Photography', 'Edina, MN', CAST(ST_SetSRID(ST_Point(-93.3499, 44.8897),4326) As geography)),
('The Bloomington Wedding Vendor', 'Bloomington, MN', CAST(ST_SetSRID(ST_Point(-86.5264, 39.1653),4326) As geography)),
('Minneapolis Wedding Vendor', 'Minneapolis, MN', CAST(ST_SetSRID(ST_Point(-93.2650, 44.9777),4326) As geography));
    
-- INSERTING SUBVENDORS
INSERT INTO subvendors (name, parent_vendor_id, vendortype_id, location, description)
VALUES ('Minnetonka Photography', 1, 1, null, 'Minnetonka Photography does a really great job doing things and stuff. I mean, wow, just really great. This one time we did this thing and people were all like, wow, that was really great. What are the great things we do? Could you list them? Well, in fact, when it comes to listing things, it is one of the great things we do, and we do a really great job of it.'),
('Minnetonka Videography', 1, 2, null, 'Minnetonka Videography does a really great job doing things and stuff. I mean, wow, just really great. This one time we did this thing and people were all like, wow, that was really great. What are the great things we do? Could you list them? Well, in fact, when it comes to listing things, it is one of the great things we do, and we do a really great job of it.'),
('Minnetonka DJ', 1, 3, CAST(ST_SetSRID(ST_Point(-93.3687, 45.0212),4326) As geography), 'Minnetonka DJ does a really great job doing things and stuff. I mean, wow, just really great. This one time we did this thing and people were all like, wow, that was really great. What are the great things we do? Could you list them? Well, in fact, when it comes to listing things, it is one of the great things we do, and we do a really great job of it.'), -- the dj is stationed out of a different office and has a different location
('Edina Wedding Photography', 2, 1, null, 'Edina Wedding Photography does a really great job doing things and stuff. I mean, wow, just really great. This one time we did this thing and people were all like, wow, that was really great. What are the great things we do? Could you list them? Well, in fact, when it comes to listing things, it is one of the great things we do, and we do a really great job of it.'),
('Bloomington Wedding Photography', 3, 1, null, null),
('The Bloomington Wedding Vendor', 3, 2, null, null),
('Minneapolis Wedding Photographers', 4, 1, null, null);


-- INSERTING PACKAGE PRICES - All photographer subvendors offer each package
INSERT INTO subvendors_packages (subvendor_id, package_id, price)
VALUES (1, 1, 2000),
(1, 2, 1800),
(1, 3, 1600),
(1, 4, 1400),
(1, 5, 1200),
(1, 6, 1000),
(4, 1, 1900),
(4, 2, 1800),
(4, 3, 1700),
(4, 4, 1600),
(4, 5, 1500),
(4, 6, 1400),
(5, 1, 900),
(5, 2, 850),
(5, 3, 750),
(5, 4, 700),
(5, 5, 650),
(5, 6, 600),
(7, 1, 1900),
(7, 2, 1800),
(7, 3, 1700),
(7, 4, 1600),
(7, 5, 1500),
(7, 6, 1400);

-- INSERTING SAMPLE AVAILABILITY - All photographer subvendors available for next 100 days
DO
$do$
BEGIN 
FOR i IN -100..400 LOOP
   INSERT INTO subvendor_availability (subvendor_id, day, availability_id)
   VALUES (1, (CURRENT_DATE) + i, 2),
   (4, (CURRENT_DATE) + i, 2);
END LOOP;
END
$do$;

-----------------------------------------------------------------------------------

------------- SET UP THAT VARIES FOR EACH ENVIRONMENT AND DEVELOPER ---------------

-----------------------------------------------------------------------------------

-- INSERT INTO users
INSERT INTO users (name, email, firebase_user_id, authentication_provider) 
VALUES ('Alice Fotografo', 'alicefotografo@gmail.com', 'HtSlvK5TTLern4NkqQyzQZ0KoYE2', 'google');

INSERT INTO users_vendors (user_id, vendor_id)
 VALUES (1, 1),
 (1,2);

-- INSERTING A MOCK STRIPE ACCOUNT
WITH stripe_account_id AS (
	INSERT INTO stripe_accounts (creator_user_id, stripe_user_id, stripe_refresh_user_token)
	VALUES (1, 'acct_103zys4vIhx7Z90Z', 'rt_AWXVluRHQ35uv4ECNxtMaeJvtb6VZ9zx5rceyF2KjUZy6EgR') 
	RETURNING id
) 
UPDATE vendors SET stripe_account_id=(SELECT id FROM stripe_account_id);
-- WHERE id=1; This line should be uncommented to just add the stripe account to one vendor, but for now, all vendors have the same stripe account


-----------------------------------------------------------------------------------

-------------------------------- SAMPLE QUERIES -----------------------------------

-----------------------------------------------------------------------------------

-- Vendors who service Eden Prairie, lat and long need to be passed in and the results are in meters
-- The Latitude and longitude of the client's current location need to be passed in to this query
SELECT COALESCE(subvendors.name, vendors.name), ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point(-93.4708, 44.8547),4326) As geography))
FROM subvendors
JOIN vendors ON vendors.id = subvendors.parent_vendor_id
WHERE (SELECT ST_Distance(
		(SELECT COALESCE(subvendors.location, vendors.location)),
		(CAST(ST_SetSRID(ST_Point(-93.4708, 44.8547),4326) As geography))
	)) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance)); -- This query would also need additional AND statements to limit to specific types of vendors, like photographers

-- Only Returning photographers (regardless of location)
SELECT COALESCE(subvendors.name, vendors.name) AS name, 
packages.name AS package, 
subvendors_packages.price
FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id 
JOIN vendors ON vendors.id = subvendors.parent_vendor_id 
JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id 
JOIN packages ON subvendors_packages.package_id = packages.id 
WHERE subvendortypes.name='photographer' 
AND packages.name='Two Photographers: 8 Hours' 
LIMIT 10;

-- Only Returning photographers that service a given area
SELECT COALESCE(subvendors.name, vendors.name) AS name, 
packages.name AS package, 
subvendors_packages.price, 
ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point(-93.26501080000003, 44.977753),4326) As geography)) AS distance 
FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id 
JOIN vendors ON vendors.id = subvendors.parent_vendor_id 
JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id 
JOIN packages ON subvendors_packages.package_id = packages.id 
WHERE subvendortypes.name='photographer' 
AND packages.name='Two Photographers: 8 Hours' 
AND (SELECT ST_Distance(
		(SELECT COALESCE(subvendors.location, vendors.location)),
		(CAST(ST_SetSRID(ST_Point(-93.26501080000003, 44.977753),4326) As geography))
	)) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance))
LIMIT 10;

SELECT *
FROM users_vendors
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id -- Get all vendors for current user - This is to only give access to users who should have access
JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=1 -- Return specific subvendor that is searched for - still based on earlier permission
JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id -- Create relation to packages
RIGHT OUTER JOIN packages ON subvendors_packages.package_id=packages.id -- Add list of all packages
WHERE packages.is_active=TRUE AND packages.vendortype_id=1; -- Limit to subvendor package types (eg photographers)


-- Only Returning photographers that service a given area on a given day
SELECT COALESCE(subvendors.name, vendors.name) AS name, 
packages.name AS package, 
subvendors_packages.price, 
ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point(-93.26501080000003, 44.977753),4326) As geography)) AS distance 
FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id 
JOIN vendors ON vendors.id = subvendors.parent_vendor_id 
JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id 
JOIN packages ON subvendors_packages.package_id = packages.id 
JOIN subvendor_availability ON subvendor_availability.subvendor_id = subvendors.id 
WHERE subvendortypes.name='photographer' 
AND packages.name='Two Photographers: 8 Hours' 
AND (SELECT ST_Distance(
		(SELECT COALESCE(subvendors.location, vendors.location)),
		(CAST(ST_SetSRID(ST_Point(-93.26501080000003, 44.977753),4326) As geography))
	)) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance)) 
AND subvendor_availability.day = '2017-12-12'
LIMIT 10;

-- Current full vendor query with rating
WITH winning_counts AS (SELECT subvendor_id, count(winning_image=subvendor_id) AS wins FROM subvendor_matchup 
FULL OUTER JOIN subvendor_images ON subvendor_matchup.winning_image = subvendor_images.id 
WHERE subvendor_matchup.user_id=1 
group by subvendor_id), 
losing_counts AS (SELECT subvendor_id, count(winning_image=subvendor_id) AS losses FROM subvendor_matchup 
FULL OUTER JOIN subvendor_images ON subvendor_matchup.losing_image = subvendor_images.id 
WHERE subvendor_matchup.user_id=1 
group by subvendor_id) 
SELECT COALESCE(subvendors.name, vendors.name) AS name,  
subvendors.id AS id,  
packages.name AS package,  
subvendors_packages.price,  
wins, 
losses, 
(COALESCE(wins, 0) * 100 / (COALESCE(wins, 0) + COALESCE(losses, 0) + 1)) AS rating,
ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point(-93.4708, 44.8547),4326) As geography)) AS distance  
FROM subvendors JOIN subvendortypes ON subvendors.vendortype_id = subvendortypes.id  
AND subvendortypes.name='photographer'  
JOIN vendors ON vendors.id = subvendors.parent_vendor_id  
JOIN stripe_accounts ON vendors.stripe_account_id=stripe_accounts.id AND stripe_accounts.is_active=TRUE  
JOIN subvendors_packages ON subvendors.id = subvendors_packages.subvendor_id  
AND subvendors_packages.package_id=2  
JOIN packages ON subvendors_packages.package_id = packages.id  
JOIN subvendor_availability ON subvendor_availability.subvendor_id = subvendors.id  
AND day='2017-12-12'  
AND subvendor_availability.availability_id = (SELECT id FROM availability WHERE status='available')  
LEFT OUTER JOIN winning_counts ON subvendors.id = winning_counts.subvendor_id  
LEFT OUTER JOIN losing_counts ON subvendors.id = losing_counts.subvendor_id  
WHERE (SELECT ST_Distance( 
		(SELECT COALESCE(subvendors.location, vendors.location)), 
		(CAST(ST_SetSRID(ST_Point(-93.4708, 44.8547),4326) As geography)) 
	)) < (SELECT COALESCE(subvendors.travel_distance, vendors.travel_distance))  
ORDER BY rating
LIMIT 10; 

-- Select all packages for a specific subvender
SELECT subvendors_packages.id AS id, 
packages.id AS package_id,  
subvendors.id AS subvendor_id,  
packages.name AS name,  
subvendors_packages.price AS price,  
subvendors_packages.is_active AS is_active  
FROM users_vendors  
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id  
JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=1  
JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id  
RIGHT OUTER JOIN packages ON subvendors_packages.package_id=packages.id  
WHERE packages.is_active=TRUE AND packages.vendortype_id=1 
ORDER BY packages.id;

-- Add a new package for a specific subvendor (next several queries)
SELECT subvendors_packages.id AS id, 
packages.id AS package_id,  
subvendors.id AS subvendor_id,  
packages.name AS name,  
subvendors_packages.price AS price,  
subvendors_packages.is_active AS is_active  
FROM users_vendors  
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id  
JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=1  
JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id  
RIGHT OUTER JOIN packages ON subvendors_packages.package_id=packages.id  
WHERE subvendors_packages.id=1;

-- Select only the correct one to be updated
SELECT subvendors_packages.id AS id, 
packages.id AS package_id,  
subvendors.id AS subvendor_id,  
packages.name AS name,  
subvendors_packages.price AS price,  
subvendors_packages.is_active AS is_active  
FROM users_vendors  
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id  
JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=1  
JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id  
RIGHT OUTER JOIN packages ON subvendors_packages.package_id=packages.id  
WHERE subvendors_packages.id=1;

-- Select only the correct id of one to be updated
UPDATE subvendors_packages
SET price=1200, is_active=TRUE 
WHERE id = (
SELECT subvendors_packages.id  
FROM users_vendors  
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id -- Validating user has access 
JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=1 -- Validating vendor is linked with subvendor
JOIN subvendors_packages ON subvendors_packages.subvendor_id=subvendors.id -- Validating subvendor is correct subvendor for this package
WHERE subvendors_packages.id=1);

-- DETERMINE IF USER SHOULD HAVE ACCESS TO SUBVENDOR DATA
SELECT subvendors.id  
FROM users_vendors  
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id -- Validating user has access 
JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=1; -- Validating vendor is linked with subvendor

-- DETERMINE IF SUBVENDOR SHOULD BE ALLOWED TO ADD THIS PACKAGE ID
SELECT id
FROM packages
WHERE id=1 AND vendortype_id=1;

-- ADD NEW SUBVENDOR PACKAGE
INSERT INTO subvendors_packages (subvendor_id, package_id, price, is_active)
VALUES (
(SELECT subvendors.id  
FROM users_vendors  
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id -- Validating user has access 
JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=1), 
(SELECT id
FROM packages
WHERE id=7 AND vendortype_id=1), 
2000,
FALSE);

-- ADD NEW VENDOR
WITH new_vendor_id AS (
	INSERT INTO vendors (name, location, travel_distance) 
	VALUES ('Bob Studios', 
			CAST(ST_SetSRID(ST_Point(COALESCE(NULL, -93.4687), COALESCE(NULL, 44.9212)),4326) AS geography), 
			100000) 
	RETURNING id
) 
INSERT INTO users_vendors (user_id, vendor_id) 
VALUES (1, (SELECT id FROM new_vendor_id));

-- ADDING NEW SUBVENDOR
INSERT INTO subvendors (name, parent_vendor_id, vendortype_id) 
VALUES ('Bob The Photographer', 
(SELECT vendors.id  
FROM users_vendors  
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id
WHERE vendors.id=1), -- making sure user has access to vendor
1); -- hard coded for photographers


-- SELECT ALL DATES FOR SUBVENDOR THAT CAN BE MADE AVAILABLE
SELECT subvendor_availability.id, day, status 
FROM subvendor_availability 
JOIN availability ON availability.id=subvendor_availability.availability_id AND subvendor_id =(
	SELECT subvendors.id  
	FROM users_vendors  
	JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id
	JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=4) -- MAKING SURE USER HAS ACCESS
WHERE day >= (SELECT current_date - cast(extract(dow from current_date) as int)) AND day < (SELECT current_date - cast(extract(dow from current_date) as int)) + 365 
ORDER BY day;

-- ADDING NEW AVAILABILITY
INSERT INTO subvendor_availability (subvendor_id, day, availability_id)
VALUES (
	(
	SELECT subvendors.id  
	FROM users_vendors  
	JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id
	JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=6
	), 
	'2018-03-03', 
	(SELECT id FROM availability WHERE status='available')
);

-- SELECT SUBVENDOR IMAGE IF USER HAS OWNERSHIP OF THAT SUBVENDOR
SELECT subvendor_images.*
FROM users_vendors 
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id  
JOIN subvendors ON vendors.id=subvendors.parent_vendor_id
JOIN subvendor_images ON subvendor_images.id = 4 AND subvendor_images.subvendor_id=subvendors.id;


-- Example of altering a table while being backwards compatible
ALTER TABLE packages ADD COLUMN "number_of_photographers" integer;
ALTER TABLE packages ADD COLUMN "number_of_hours" integer;
ALTER TABLE packages ADD COLUMN "engagement_session_is_included" BOOLEAN;

UPDATE packages SET number_of_photographers=2 WHERE name LIKE 'Two Photographers%';
UPDATE packages SET number_of_photographers=1 WHERE name LIKE 'One Photographer%';
UPDATE packages SET number_of_hours=10 WHERE name LIKE '%10 Hours%';
UPDATE packages SET number_of_hours=8 WHERE name LIKE '%8 Hours%';
UPDATE packages SET number_of_hours=6 WHERE name LIKE '%6 Hours%';
UPDATE packages SET number_of_hours=4 WHERE name LIKE '%4 Hours%';
UPDATE packages SET engagement_session_is_included=(name LIKE '%1 hour Engagement Session Included');

ALTER TABLE packages ALTER COLUMN "number_of_hours" SET NOT NULL;
ALTER TABLE packages ALTER COLUMN "number_of_photographers" SET NOT NULL;
ALTER TABLE packages ALTER COLUMN "engagement_session_is_included" SET NOT NULL;

INSERT INTO packages (id, name, vendortype_id, number_of_photographers, number_of_hours, engagement_session_is_included)
VALUES 
(13, 'Two Photographers: 6 Hours', 1, 2, 6, FALSE),
(14, 'Two Photographers: 4 Hours', 1, 2, 4, FALSE),
(15, 'Two Photographers: 6 Hours - 1 hour Engagement Session Included', 1, 2, 6, TRUE),
(16, 'Two Photographers: 4 Hours - 1 hour Engagement Session Included', 1, 2, 4, TRUE);

SELECT * FROM packages;