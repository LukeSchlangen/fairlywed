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
	travelDistance INT NOT NULL DEFAULT 10000, -- Default to 10 kilometer radius
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE users_vendors (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users,
	vendor_id INT NOT NULL REFERENCES vendors
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
	vendor_type INT NOT NULL REFERENCES subvendortypes,
	url_slug VARCHAR(200) UNIQUE NOT NULL,
	is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE clients (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users
);


-- INSERTING SAMPLE VENDOR DATA

-- INSERTING SUBVENDOR TYPES
INSERT INTO subvendortypes (name)
VALUES ('photographer'), ('videographer'), ('dj');

-- INSERTING VENDORS
INSERT INTO vendors (name, location)
VALUES ('Big Time Minnetonka Wedding Vendor', CAST(ST_SetSRID(ST_Point(-93.4687, 44.9212),4326) As geography)),
('Edina Wedding Photography', CAST(ST_SetSRID(ST_Point(-93.3499, 44.8897),4326) As geography)),
('The Bloomington Wedding Vendor', CAST(ST_SetSRID(ST_Point(-86.5264, 39.1653),4326) As geography));
    
-- INSERTING SUBVENDORS
INSERT INTO subvendors (name, parent_vendor_id, vendor_type, url_slug, location)
VALUES ('Minnetonka Photography', 1, 1, 'minnetonka-photography', null),
('Minnetonka Videography', 1, 2, 'minnetonka-videography', null),
('Minnetonka DJ', 1, 3, 'minnetonka-dj', CAST(ST_SetSRID(ST_Point(-93.3687, 45.0212),4326) As geography)), -- the dj is stationed out of a different office and has a different location
(null, 2, 1, 'edina-wedding-photography', null),
('Bloomington Wedding Photography', 3, 1, 'bloomington-wedding-photography', null),
(null, 3, 2, 'bloomington-videography', null);

-- SAMPLE QUERIES

-- VENDORS SERVING GIVEN LOCATION
-- Vendors who service Eden Prairie, lat and long need to be passed in and the results are in meters
-- The Latitude and longitude of the client's current location need to be passed in to this query
SELECT COALESCE(subvendors.name, vendors.name), ST_Distance((SELECT COALESCE(subvendors.location, vendors.location)), CAST(ST_SetSRID(ST_Point(-93.4708, 44.8547),4326) As geography))
FROM subvendors
JOIN vendors ON vendors.id = subvendors.parent_vendor_id
WHERE (SELECT ST_Distance(
		(SELECT COALESCE(subvendors.location, vendors.location)),
		(CAST(ST_SetSRID(ST_Point(-93.4708, 44.8547),4326) As geography))
	)) < (SELECT COALESCE(subvendors.travelDistance, vendors.travelDistance)); -- This query would also need additional AND statements to limit to specific types of vendors, like photographers