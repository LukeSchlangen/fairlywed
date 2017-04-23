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
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE logs (
	id SERIAL PRIMARY KEY,
	time TIMESTAMP DEFAULT NOW() NOT NULL,
	action VARCHAR(200) NOT NULL,
	user_id INT NOT NULL REFERENCES users
);

CREATE TABLE vendors (
	id SERIAL PRIMARY KEY,
	name VARCHAR(500) NOT NULL,
	location geography NOT NULL,
	travelDistance INT DEFAULT 16093 NOT NULL, -- Default to 10 mile radius
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE users_vendors (
	id SERIAL,
	user_id INT NOT NULL REFERENCES users,
	vendor_id INT NOT NULL REFERENCES vendors,
	PRIMARY KEY(user_id, vendor_id)
);

CREATE TABLE subvendortypes (
	id SERIAL PRIMARY KEY,
	name VARCHAR(500) NOT NULL
);

CREATE TABLE subvendors (
	id SERIAL PRIMARY KEY,
	name VARCHAR(500) UNIQUE NOT NULL,
	location geography, -- if null, pull value from the parent
	travelDistance INT, -- if null, pull value from the parent
	description VARCHAR(2000),
	parent_vendor_id INT NOT NULL REFERENCES vendors,
	vendortype_id INT NOT NULL REFERENCES subvendortypes,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE packages(
	id SERIAL PRIMARY KEY,
	vendortype_id INT NOT NULL REFERENCES subvendortypes,
	name VARCHAR(500) UNIQUE NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE subvendors_packages (
	id SERIAL,
	subvendor_id INT NOT NULL REFERENCES subvendors,
	package_id INT NOT NULL REFERENCES packages,
	price INT CHECK (price > 100 AND price <100000),
	is_active BOOLEAN DEFAULT TRUE NOT NULL,
	PRIMARY KEY(subvendor_id, package_id)
);

CREATE TABLE clients (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users
);

CREATE TABLE users_clients (
	id SERIAL,
	user_id INT NOT NULL REFERENCES users,
	client_id INT NOT NULL REFERENCES clients,
	PRIMARY KEY(user_id, client_id)
);

CREATE TABLE availability (
	id SERIAL PRIMARY KEY,
	status VARCHAR(500) NOT NULL
);

CREATE TABLE calendar_dates (
	id SERIAL PRIMARY KEY,
	day DATE
);

CREATE TABLE subvendor_availability (
	id SERIAL,
	subvendor_id INT NOT NULL REFERENCES subvendors,
	date_id INT NOT NULL REFERENCES calendar_dates,
    availability_id INT NOT NULL REFERENCES availability,
	PRIMARY KEY(subvendor_id, date_id)
);

CREATE TABLE bookings (
	id SERIAL PRIMARY KEY,
	packages_id INT NOT NULL REFERENCES packages,
	subvendor_id INT NOT NULL REFERENCES subvendors,
	time TIMESTAMP NOT NULL,
	-- firebase_user_id VARCHAR(500) UNIQUE NOT NULL,
	requests TEXT,
	location geography NOT NULL,
	phone_number TEXT NOT NULL
);

CREATE TABLE subvendor_images (
	id SERIAL PRIMARY KEY,
	original_name VARCHAR(500) NOT NULL,
	encoding VARCHAR(500) NOT NULL,
	mime_type VARCHAR(500) NOT NULL,
    subvendor_id INT NOT NULL REFERENCES subvendors,
	is_public BOOLEAN DEFAULT FALSE NOT NULL,
	is_in_gallery BOOLEAN DEFAULT FALSE NOT NULL,
	is_active BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE matchmaker_run (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users,
	prior_run_id INT,
	FOREIGN KEY (prior_run_id) REFERENCES matchmaker_run(id)
);

CREATE TABLE matchmaker_liked_photos (
	id SERIAL PRIMARY KEY,
	matchmaker_run_id INT NOT NULL REFERENCES matchmaker_run,
	subvendor_images_id INT NOT NULL REFERENCES subvendor_images,
	liked BOOLEAN DEFAULT FALSE NOT NULL
);

-- INSERTING SAMPLE VENDOR DATA

-- INSERTING SUBVENDOR TYPES
INSERT INTO subvendortypes (name)
VALUES ('photographer'), ('videographer'), ('dj');

-- INSERTING VENDORS
INSERT INTO vendors (name, location)
VALUES ('Big Time Minnetonka Wedding Vendor', CAST(ST_SetSRID(ST_Point(-93.4687, 44.9212),4326) As geography)),
('Edina Wedding Photography', CAST(ST_SetSRID(ST_Point(-93.3499, 44.8897),4326) As geography)),
('The Bloomington Wedding Vendor', CAST(ST_SetSRID(ST_Point(-86.5264, 39.1653),4326) As geography)),
('Minneapolis Wedding Vendor', CAST(ST_SetSRID(ST_Point(-93.2650, 44.9777),4326) As geography));
    
-- INSERTING SUBVENDORS
INSERT INTO subvendors (name, parent_vendor_id, vendortype_id, location, description)
VALUES ('Minnetonka Photography', 1, 1, null, 'Minnetonka Photography does a really great job doing things and stuff. I mean, wow, just really great. This one time we did this thing and people were all like, wow, that was really great. What are the great things we do? Could you list them? Well, in fact, when it comes to listing things, it is one of the great things we do, and we do a really great job of it.'),
('Minnetonka Videography', 1, 2, null, 'Minnetonka Videography does a really great job doing things and stuff. I mean, wow, just really great. This one time we did this thing and people were all like, wow, that was really great. What are the great things we do? Could you list them? Well, in fact, when it comes to listing things, it is one of the great things we do, and we do a really great job of it.'),
('Minnetonka DJ', 1, 3, CAST(ST_SetSRID(ST_Point(-93.3687, 45.0212),4326) As geography), 'Minnetonka DJ does a really great job doing things and stuff. I mean, wow, just really great. This one time we did this thing and people were all like, wow, that was really great. What are the great things we do? Could you list them? Well, in fact, when it comes to listing things, it is one of the great things we do, and we do a really great job of it.'), -- the dj is stationed out of a different office and has a different location
('Edina Wedding Photography', 2, 1, null, 'Edina Wedding Photography does a really great job doing things and stuff. I mean, wow, just really great. This one time we did this thing and people were all like, wow, that was really great. What are the great things we do? Could you list them? Well, in fact, when it comes to listing things, it is one of the great things we do, and we do a really great job of it.'),
('Bloomington Wedding Photography', 3, 1, null, null),
('The Bloomington Wedding Vendor', 3, 2, null, null),
('Minneapolis Wedding Photographers', 4, 1, null, null);

-- INSERTING PACKAGES
INSERT INTO packages (name, vendortype_id)
VALUES ('Two Photographers: 10 Hours', 1),
('Two Photographers: 8 Hours', 1),
('One Photographer: 10 Hours', 1),
('One Photographer: 8 Hours', 1),
('One Photographer: 6 Hours', 1),
('One Photographer: 4 Hours', 1),
('Two Photographers: 10 Hours - 1 hour Engagement Session Included', 1),
('Two Photographers: 8 Hours - 1 hour Engagement Session Included', 1),
('One Photographer: 10 Hours - 1 hour Engagement Session Included', 1),
('One Photographer: 8 Hours - 1 hour Engagement Session Included', 1),
('One Photographer: 6 Hours - 1 hour Engagement Session Included', 1),
('One Photographer: 4 Hours - 1 hour Engagement Session Included', 1);


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

-- CREATING AVAILABILITY STATUSES
INSERT INTO availability (status)
VALUES ('unavailable'), ('available'), ('booked');

-- INSERTING SAMPLE AVAILABILITY - All photographer subvendors available for next 100 days
DO
$do$
BEGIN 
FOR i IN -100..400 LOOP
	WITH new_calendar_date_id AS (
		INSERT INTO calendar_dates (day) 
		VALUES ((CURRENT_DATE) + i) 
		RETURNING id
	) 
   INSERT INTO subvendor_availability (subvendor_id, date_id, availability_id)
   VALUES (1, (SELECT id FROM new_calendar_date_id), 2),
   (4, (SELECT id FROM new_calendar_date_id), 2);
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
	)) < (SELECT COALESCE(subvendors.travelDistance, vendors.travelDistance)); -- This query would also need additional AND statements to limit to specific types of vendors, like photographers

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
	)) < (SELECT COALESCE(subvendors.travelDistance, vendors.travelDistance))
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
	)) < (SELECT COALESCE(subvendors.travelDistance, vendors.travelDistance)) 
AND subvendor_availability.date_id = (SELECT id FROM calendar_dates WHERE day='2017-12-12') 
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
	INSERT INTO vendors (name, location, traveldistance) 
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
RIGHT OUTER JOIN calendar_dates ON calendar_dates.id=subvendor_availability.date_id 
WHERE day >= (SELECT current_date - cast(extract(dow from current_date) as int)) AND day < (SELECT current_date - cast(extract(dow from current_date) as int)) + 365 
ORDER BY day;

-- ADDING NEW AVAILABILITY
INSERT INTO subvendor_availability (subvendor_id, date_id, availability_id)
VALUES (
	(
	SELECT subvendors.id  
	FROM users_vendors  
	JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id
	JOIN subvendors ON vendors.id=subvendors.parent_vendor_id AND subvendors.id=6
	), 
	(SELECT id FROM calendar_dates WHERE day='2018-03-03'), 
	(SELECT id FROM availability WHERE status='available')
);

-- SELECT SUBVENDOR IMAGE IF USER HAS OWNERSHIP OF THAT SUBVENDOR
SELECT subvendor_images.*
FROM users_vendors 
JOIN vendors ON users_vendors.user_id=1 AND vendors.id=users_vendors.vendor_id  
JOIN subvendors ON vendors.id=subvendors.parent_vendor_id
JOIN subvendor_images ON subvendor_images.id = 4 AND subvendor_images.subvendor_id=subvendors.id;
