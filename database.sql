CREATE EXTENSION postgis;

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name VARCHAR(200) NOT NULL,
	email VARCHAR(200) NOT NULL,
	firebase_user_id VARCHAR(500) UNIQUE NOT NULL,
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
	travelDistance INT NOT NULL DEFAULT 100000, -- Default to 100 kilometer radius
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE users_vendors (
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
	name VARCHAR(500), -- if null, pull value from the parent
	location geography, -- if null, pull value from the parent
	travelDistance INT, -- if null, pull value from the parent
	parent_vendor_id INT NOT NULL REFERENCES vendors,
	vendortype_id INT NOT NULL REFERENCES subvendortypes,
	url_slug VARCHAR(200) UNIQUE NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE packages(
	id SERIAL PRIMARY KEY,
	vendortype_id INT NOT NULL REFERENCES subvendortypes,
	name VARCHAR(500) UNIQUE NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE subvendors_packages (
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
	user_id INT NOT NULL REFERENCES users,
	client_id INT NOT NULL REFERENCES clients,
	PRIMARY KEY(user_id, client_id)
);

CREATE TABLE availability (
	id SERIAL PRIMARY KEY,
	status VARCHAR(500) NOT NULL
);

CREATE TABLE subvendor_availability (
	subvendor_id INT NOT NULL REFERENCES subvendors,
	day DATE,
    availability_id INT NOT NULL REFERENCES subvendors,
	PRIMARY KEY(subvendor_id, day)
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
INSERT INTO subvendors (name, parent_vendor_id, vendortype_id, url_slug, location)
VALUES ('Minnetonka Photography', 1, 1, 'minnetonka-photography', null),
('Minnetonka Videography', 1, 2, 'minnetonka-videography', null),
('Minnetonka DJ', 1, 3, 'minnetonka-dj', CAST(ST_SetSRID(ST_Point(-93.3687, 45.0212),4326) As geography)), -- the dj is stationed out of a different office and has a different location
(null, 2, 1, 'edina-wedding-photography', null),
('Bloomington Wedding Photography', 3, 1, 'bloomington-wedding-photography', null),
(null, 3, 2, 'bloomington-videography', null),
('Minneapolis Wedding Photographers', 4, 1, 'mineapolis-wedding-photographers', null);

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
VALUES ('available'), ('booked');

-- INSERTING SAMPLE AVAILABILITY - All photographer subvendors available for next 100 days
DO
$do$
BEGIN 
FOR i IN 1..800 LOOP
   INSERT INTO subvendor_availability (subvendor_id, day, availability_id)
   VALUES (1, (CURRENT_DATE) + i, 1);
   INSERT INTO subvendor_availability (subvendor_id, day, availability_id)
   VALUES (4, (CURRENT_DATE) + i, 1);
   INSERT INTO subvendor_availability (subvendor_id, day, availability_id)
   VALUES (5, (CURRENT_DATE) + i, 1);
   INSERT INTO subvendor_availability (subvendor_id, day, availability_id)
   VALUES (6, (CURRENT_DATE) + i, 1);
END LOOP;
END
$do$;

-- SAMPLE QUERIES

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
subvendors_packages.price, 
subvendors.url_slug AS url 
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
subvendors.url_slug AS url, 
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