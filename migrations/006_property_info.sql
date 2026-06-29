-- Auto-generated from PropInfo.xlsx 2026-06-29
-- Updates name/owner_entity/address only where currently blank

UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Cedar Trace' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LX Cedar Trace, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2000 McKelvey Hill Dr; Maryland Heights, MO 63043' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2000 McKelvey Hill Dr; Maryland Heights, MO 63043' ELSE owner_notice_addr END
  WHERE code = 'ctmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'River Chase' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXVI River Chase, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2280 Keeven Lane; Florissant, MO 63031' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2280 Keeven Lane; Florissant, MO 63031' ELSE owner_notice_addr END
  WHERE code = 'rcmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Sugar Pines' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XCVIII SUGAR PINES SUB LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '11011 Sugar Pines Ct; Florissant, MO 63033' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '11011 Sugar Pines Ct; Florissant, MO 63033' ELSE owner_notice_addr END
  WHERE code = 'sgmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Westport Station' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XCVIII Westport Station Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '11155 Westport Station Drive; Maryland Heights, MO 63043' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '11155 Westport Station Drive; Maryland Heights, MO 63043' ELSE owner_notice_addr END
  WHERE code = 'wsmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Woodhollow' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXIII Woodhollow, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1871 McKelvey Hill Rd; Maryland Heights, MO 63043' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1871 McKelvey Hill Rd; Maryland Heights, MO 63043' ELSE owner_notice_addr END
  WHERE code = 'whmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Imperial Gardens' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLX Imperial Gardens Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3630 Imperial Gardens; St. Ann, MO 63074' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3630 Imperial Gardens; St. Ann, MO 63074' ELSE owner_notice_addr END
  WHERE code = 'igmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Nantucket Gardens' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLX Nantucket Gardens Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '27 Joyce Ellen Lane; St. Louis, MO 63135' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '27 Joyce Ellen Lane; St. Louis, MO 63135' ELSE owner_notice_addr END
  WHERE code = 'ngmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'San Rafael' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLX San Rafael Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '8456 San Rafael Place; St. Louis, MO 63114' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '8456 San Rafael Place; St. Louis, MO 63114' ELSE owner_notice_addr END
  WHERE code = 'srmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Village Square' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLX Village Square Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '503 Village Square Drive; Hazelwood, MO 63042' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '503 Village Square Drive; Hazelwood, MO 63042' ELSE owner_notice_addr END
  WHERE code = 'vsmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Paddock Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXIX Paddock Village, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '12213 Culpepper Drive; Florissant, MO 63033' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '12213 Culpepper Drive; Florissant, MO 63033' ELSE owner_notice_addr END
  WHERE code = 'pvmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Emerald Crossing' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCVII Emerald Crossing, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '10556 Emerald Ridge Ave; Overland, MO 63114' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '10556 Emerald Ridge Ave; Overland, MO 63114' ELSE owner_notice_addr END
  WHERE code = 'ecmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Victorian Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCVI Victorian Village, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '11969 Continental Drive; St. Louis, MO 63138' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '11969 Continental Drive; St. Louis, MO 63138' ELSE owner_notice_addr END
  WHERE code = 'vvmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Greenway Chase' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXIII Greenway Chase, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '629 Greenway Manor Dr; Florissant, MO 63031' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '629 Greenway Manor Dr; Florissant, MO 63031' ELSE owner_notice_addr END
  WHERE code = 'gcmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Westpark  & Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXVIII Westpark, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '11409 Tivoli Lane; St. Louis, MO 63146' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '11409 Tivoli Lane; St. Louis, MO 63146' ELSE owner_notice_addr END
  WHERE code = 'wpmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'McMillen Woods' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXIII McMillen Woods, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '95 S Westmoor Ave; Newark, OH 43055' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '95 S Westmoor Ave; Newark, OH 43055' ELSE owner_notice_addr END
  WHERE code = 'mwoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Madison Grove Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXXIII Three Rivers, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2800 Booty Dr; Columbus, OH 43207' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2800 Booty Dr; Columbus, OH 43207' ELSE owner_notice_addr END
  WHERE code = 'troh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Wake Robin' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG L Wake Robin, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1690 Bob-O-Link Bend; Columbus, OH 43229' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1690 Bob-O-Link Bend; Columbus, OH 43229' ELSE owner_notice_addr END
  WHERE code = 'wroh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Central Square' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXV Central Square, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1844 Forest Village Lane; Columbus, OH 43229' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1844 Forest Village Lane; Columbus, OH 43229' ELSE owner_notice_addr END
  WHERE code = 'csoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Taylor Square' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Creekside Acquisition Columbus Associates II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2422 Banks Edge Way; Reynoldsburg, OH 43068' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2422 Banks Edge Way; Reynoldsburg, OH 43068' ELSE owner_notice_addr END
  WHERE code = 'tsoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Ardsley Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'FREG Ardsley Ridge Associates II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '735 Marlan Ave; Reynoldsburg, OH 43068' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '735 Marlan Ave; Reynoldsburg, OH 43068' ELSE owner_notice_addr END
  WHERE code = 'ayoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Bayberry Place Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Bayberry Place Townhomes II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2300 Deewood Dr; Columbus , OH 43229' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2300 Deewood Dr; Columbus , OH 43229' ELSE owner_notice_addr END
  WHERE code = 'bpoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'District at Ashland' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXIX District at Ashland Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1800 Arrowhead Way; Ashland, OH 44805' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1800 Arrowhead Way; Ashland, OH 44805' ELSE owner_notice_addr END
  WHERE code = 'daoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Summerhouse Square' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXVIII Summerhouse Square, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '327 Union St; Newark, OH 43055' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '327 Union St; Newark, OH 43055' ELSE owner_notice_addr END
  WHERE code = 'ssoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Dogwood Apartment' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXL Dogwood, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1355 Western Ave; Chillicothe, OH 45601' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1355 Western Ave; Chillicothe, OH 45601' ELSE owner_notice_addr END
  WHERE code = 'dwoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Woodland Heights' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLII Woodland Heights, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '547 Plyleys Lane; Chillicothe, OH 45601' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '547 Plyleys Lane; Chillicothe, OH 45601' ELSE owner_notice_addr END
  WHERE code = 'whoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Wexford Village at Devonshire' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLI Wexford, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '98 Devonshire Drive; Scott Depot, WV 25560' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '98 Devonshire Drive; Scott Depot, WV 25560' ELSE owner_notice_addr END
  WHERE code = 'twwv';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Brickyard' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Brickyard Apartments II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3701 Upper Mt Vernon Rd; Evansville, IN 47712' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3701 Upper Mt Vernon Rd; Evansville, IN 47712' ELSE owner_notice_addr END
  WHERE code = 'tbin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Pavilion Lakes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXIX Pavilion Lakes, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '100 Williamsburg Drive; Evansville, IN 47715' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '100 Williamsburg Drive; Evansville, IN 47715' ELSE owner_notice_addr END
  WHERE code = 'plin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Abbey Court' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCIV Abbey Court, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5301 Stonehedge Dr. ; Evansville, IN 47715' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5301 Stonehedge Dr. ; Evansville, IN 47715' ELSE owner_notice_addr END
  WHERE code = 'acin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Addison Place' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'TG ADDISON PLACE II LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1165 Shiloh Square; Evansville, IN 47714' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1165 Shiloh Square; Evansville, IN 47714' ELSE owner_notice_addr END
  WHERE code = 'apin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Indian Woods' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'TG INDIAN WOODS II LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1900 Pueblo Pass; Evansville, IN 47715' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1900 Pueblo Pass; Evansville, IN 47715' ELSE owner_notice_addr END
  WHERE code = 'iwin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'North Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'TG NORTH PARK II LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1125 Wellington Dr; Evansville, IN 47710' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1125 Wellington Dr; Evansville, IN 47710' ELSE owner_notice_addr END
  WHERE code = 'npin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Bluegrass Villas' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLV WKY Owensboro Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3750 Ralph Avenue; Owensboro, KY 42303' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3750 Ralph Avenue; Owensboro, KY 42303' ELSE owner_notice_addr END
  WHERE code = 'bvky';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Bradford Chase' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLII Bradford Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '24 Williamsburg Village Drive; Jackson, TN 38305' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '24 Williamsburg Village Drive; Jackson, TN 38305' ELSE owner_notice_addr END
  WHERE code = 'bctn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Post House Jackson' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLII Jackson Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '26 Rachel Drive; Jackson, TN 38305' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '26 Rachel Drive; Jackson, TN 38305' ELSE owner_notice_addr END
  WHERE code = 'pjtn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Post House North' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLII North Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '26 Revere Circle; Jackson, TN 38305' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '26 Revere Circle; Jackson, TN 38305' ELSE owner_notice_addr END
  WHERE code = 'pntn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Oaks' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLII Oaks Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '842 N Parkway; Jackson, TN 38305' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '842 N Parkway; Jackson, TN 38305' ELSE owner_notice_addr END
  WHERE code = 'totn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Woods of Post House' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLII Woods Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '39 Thistlewood Drive; Jackson, TN 38305' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '39 Thistlewood Drive; Jackson, TN 38305' ELSE owner_notice_addr END
  WHERE code = 'wptn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Arbors at Eastland' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LII Arbors at Eastland, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '208 S Prospect Rd; Bloomington, IL 61704' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '208 S Prospect Rd; Bloomington, IL 61704' ELSE owner_notice_addr END
  WHERE code = 'aeil';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Golfview Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXVII GOLFVIEW VILLAGE, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '620 Willow Pond Road; Rantoul, IL 61866' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '620 Willow Pond Road; Rantoul, IL 61866' ELSE owner_notice_addr END
  WHERE code = 'gvil';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Timber Cove' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CIII TIMBER COVE, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1707 S. Country Club Road; Decatur, IL 62521' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1707 S. Country Club Road; Decatur, IL 62521' ELSE owner_notice_addr END
  WHERE code = 'tvil';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Rosemoore Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXV Rosemoore, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2235 S Koke Mill Rd; Springfield, IL 62711' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2235 S Koke Mill Rd; Springfield, IL 62711' ELSE owner_notice_addr END
  WHERE code = 'rmil';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Quarry' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLV Quarry, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3710 N Community Drive; Decatur, IL 62526' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3710 N Community Drive; Decatur, IL 62526' ELSE owner_notice_addr END
  WHERE code = 'tqil';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Indian Springs' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXV Indian Springs Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2609 Bow Court; South Bend, IN 46628' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2609 Bow Court; South Bend, IN 46628' ELSE owner_notice_addr END
  WHERE code = 'isin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Village Quarter' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Village Quarter Associates IV-B, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '100 Village Dr.; Terre Haute, IN 47803' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '100 Village Dr.; Terre Haute, IN 47803' ELSE owner_notice_addr END
  WHERE code = 'vqin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Northwind' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'JN Holdings II-B, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3225 E Goldenrod Ave; Terre Haute, IN 47805' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3225 E Goldenrod Ave; Terre Haute, IN 47805' ELSE owner_notice_addr END
  WHERE code = 'nwin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Willow Crossings' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'SIIC One Senior-B, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1200 E Elmwood Dr; Terre Haute, IN 47802' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1200 E Elmwood Dr; Terre Haute, IN 47802' ELSE owner_notice_addr END
  WHERE code = 'wcin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Williamsburg Way' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Williamsburg Way Apartments II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3838 Williamsburg Way; Columbus, IN 47203' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3838 Williamsburg Way; Columbus, IN 47203' ELSE owner_notice_addr END
  WHERE code = 'wwin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Westminster  & Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Westminster Associates II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '921 Parliament Place; Greenwood, IN 46142' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '921 Parliament Place; Greenwood, IN 46142' ELSE owner_notice_addr END
  WHERE code = 'wmin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'River Pointe' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'River Pointe II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '350 Bercado Circle; Mishawaka, IN 46544' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '350 Bercado Circle; Mishawaka, IN 46544' ELSE owner_notice_addr END
  WHERE code = 'rpin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Westcreek Villas' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLV WKY Paducah Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2651 Perkins Creek Drive; Paducah, KY 42001' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2651 Perkins Creek Drive; Paducah, KY 42001' ELSE owner_notice_addr END
  WHERE code = 'wvky';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Suson Pines' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXVII Suson Pines, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5265 Suson Hills Dr; St. Louis, MO 63128' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5265 Suson Hills Dr; St. Louis, MO 63128' ELSE owner_notice_addr END
  WHERE code = 'spmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Greenmar' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LV Greenmar, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1054 Green Mountain Court; Fenton, MO 63026' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1054 Green Mountain Court; Fenton, MO 63026' ELSE owner_notice_addr END
  WHERE code = 'gmmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Retreat at Seven Trails' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XCIII Seven Trails, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '500 Seven Trails Drive; Ballwin, MO 63011' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '500 Seven Trails Drive; Ballwin, MO 63011' ELSE owner_notice_addr END
  WHERE code = 'stmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Westchester Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XCVIII Westchester Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '941 Clubhouse Lane; O''Fallon, MO 63366' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '941 Clubhouse Lane; O''Fallon, MO 63366' ELSE owner_notice_addr END
  WHERE code = 'wvmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Hunters Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVII Hunters Ridge Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5625 Hunters Valley Court; St. Louis, MO 63129' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5625 Hunters Valley Court; St. Louis, MO 63129' ELSE owner_notice_addr END
  WHERE code = 'hrmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Southpointe' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVII Southpointe Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '9950 Pointe South Dr.; Sappington, MO 63128' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '9950 Pointe South Dr.; Sappington, MO 63128' ELSE owner_notice_addr END
  WHERE code = 'somo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Canyon Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXVIII Canyon Creek, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4851 Lemay Ferry Rd; Mehlville, MO 63129' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4851 Lemay Ferry Rd; Mehlville, MO 63129' ELSE owner_notice_addr END
  WHERE code = 'ccmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Villages at General Grant' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXVII General Grant Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '7482 Hardscrapple Drive; Affton, MO 63123' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '7482 Hardscrapple Drive; Affton, MO 63123' ELSE owner_notice_addr END
  WHERE code = 'ggmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Heritage Estates' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXVII Heritage Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '9196 Heritage Drive; Affton, MO 63123' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '9196 Heritage Drive; Affton, MO 63123' ELSE owner_notice_addr END
  WHERE code = 'hemo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Southwoods' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXVII Southwoods Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '9287 Fort Sumter Lane; Sappington, MO 63126' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '9287 Fort Sumter Lane; Sappington, MO 63126' ELSE owner_notice_addr END
  WHERE code = 'swmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Village Royale' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXVII Village Royale Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5602 Duessel Lane; St. Louis, MO 63128' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5602 Duessel Lane; St. Louis, MO 63128' ELSE owner_notice_addr END
  WHERE code = 'vrmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Park Commons' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLV Park Commons, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '600 Park Commons Ct; Valley Park, MO 63088' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '600 Park Commons Ct; Valley Park, MO 63088' ELSE owner_notice_addr END
  WHERE code = 'pcmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The District' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXVI The District, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '633 N McKnight Road; St Louis, MO 63132' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '633 N McKnight Road; St Louis, MO 63132' ELSE owner_notice_addr END
  WHERE code = 'tdmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Vicino on the Lake' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXIX Vicino on the Lake, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1003 Mariners Point Dr.; Creve Coeur, MO 63141' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1003 Mariners Point Dr.; Creve Coeur, MO 63141' ELSE owner_notice_addr END
  WHERE code = 'vlmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fox Hill' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Foxhill Apartment Associates, L.L.C.' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '17611 West 16th Avenue; Golden, CO 80401' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '17611 West 16th Avenue; Golden, CO 80401' ELSE owner_notice_addr END
  WHERE code = 'fh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Meadow Lark' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Meadow Lark Apartments, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '953 S Troy St; Aurora, CO 80012' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '953 S Troy St; Aurora, CO 80012' ELSE owner_notice_addr END
  WHERE code = 'ml';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Federal 6' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CC Federal Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2775 S. Federal Blvd.; Denver, CO 80236' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2775 S. Federal Blvd.; Denver, CO 80236' ELSE owner_notice_addr END
  WHERE code = 'f6co';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Barrington Place at Somerset' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLIV Barrington Place, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '280 New Haven Blvd; Montgomery, AL 36117' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '280 New Haven Blvd; Montgomery, AL 36117' ELSE owner_notice_addr END
  WHERE code = 'bpal';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Heritage Knoll' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXVIII Heritage Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5536 Bigger Road; Kettering, OH 45440' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5536 Bigger Road; Kettering, OH 45440' ELSE owner_notice_addr END
  WHERE code = 'hkoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Stonebridge Apartment Homes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXVIII Stonebridge Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4481 Stonecastle Drive; Beavercreek, OH 45440' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4481 Stonecastle Drive; Beavercreek, OH 45440' ELSE owner_notice_addr END
  WHERE code = 'sboh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Breckenridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Breckenridge Advisers II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '239 Orville St; Fairborn, OH 45324' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '239 Orville St; Fairborn, OH 45324' ELSE owner_notice_addr END
  WHERE code = 'broh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Woodman Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Woodman Park Apartments II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4996 Woodman Park Drive; Dayton, OH 45432' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4996 Woodman Park Drive; Dayton, OH 45432' ELSE owner_notice_addr END
  WHERE code = 'wpoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Van Buren Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXIX Van Buren Village, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3456 S Smithville Rd; Kettering, OH 45420' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3456 S Smithville Rd; Kettering, OH 45420' ELSE owner_notice_addr END
  WHERE code = 'vboh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Arlington Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'A-V Partners II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1733 Arlin Place; Fairborn, OH 45324' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1733 Arlin Place; Fairborn, OH 45324' ELSE owner_notice_addr END
  WHERE code = 'avoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Bavarian Woods' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Bavarian Woods Owner II LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '154 Bavarian Street; Middletown, OH 45044' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '154 Bavarian Street; Middletown, OH 45044' ELSE owner_notice_addr END
  WHERE code = 'bwoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Meadowrun' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Meadowrun II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2294 Zink Road; Fairborn, OH 45324' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2294 Zink Road; Fairborn, OH 45324' ELSE owner_notice_addr END
  WHERE code = 'mroh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Residenz' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Residenz II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '740 Residenz Parkway; Kettering, OH 45429' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '740 Residenz Parkway; Kettering, OH 45429' ELSE owner_notice_addr END
  WHERE code = 'rzoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Eagle Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Eagle Ridge Ohio II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2375 Eagle Ridge Drive; Miami Township, OH 45459' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2375 Eagle Ridge Drive; Miami Township, OH 45459' ELSE owner_notice_addr END
  WHERE code = 'eroh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Village on Beaver Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Oliver Realty Investors 1984 - D II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3722 B E. Patterson Road; Beavercreek, OH 45430' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3722 B E. Patterson Road; Beavercreek, OH 45430' ELSE owner_notice_addr END
  WHERE code = 'bcoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Pine Run Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Imperial Heights Partners II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5541 Bengie Court; Huber Heights, OH 45424' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5541 Bengie Court; Huber Heights, OH 45424' ELSE owner_notice_addr END
  WHERE code = 'proh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Northlake Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXI Northlake Village, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1741 Lucille Drive; Lima, OH 45801' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1741 Lucille Drive; Lima, OH 45801' ELSE owner_notice_addr END
  WHERE code = 'nvoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Georgetown of Kettering' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'GK OH Apartments II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4889 Far Hills Avenue; Kettering, OH 45429' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4889 Far Hills Avenue; Kettering, OH 45429' ELSE owner_notice_addr END
  WHERE code = 'gkoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Avalon Place' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'NL Core Avalon Place II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2196 Rockdell Drive; Fairborn, OH 45324' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2196 Rockdell Drive; Fairborn, OH 45324' ELSE owner_notice_addr END
  WHERE code = 'anoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Brookfield Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLV Brookfield Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2536 SW Brandywine Ln; Topeka, KS 66614' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2536 SW Brandywine Ln; Topeka, KS 66614' ELSE owner_notice_addr END
  WHERE code = 'bvks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Crown Colony' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLV Crown Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '900 SW Robinson Ave; Topeka, KS 66606' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '900 SW Robinson Ave; Topeka, KS 66606' ELSE owner_notice_addr END
  WHERE code = 'ccks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Mariposa Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLV Mariposa Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2536 SW Brandywine Ln; Topeka, KS 66614' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2536 SW Brandywine Ln; Topeka, KS 66614' ELSE owner_notice_addr END
  WHERE code = 'mpks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Sherwood' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLV Sherwood Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2745 SW Villa West Dr; Topeka, KS 66614' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2745 SW Villa West Dr; Topeka, KS 66614' ELSE owner_notice_addr END
  WHERE code = 'swks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Villa West' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLV Villa Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2744 SW Villa West Dr; Topeka, KS 66614' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2744 SW Villa West Dr; Topeka, KS 66614' ELSE owner_notice_addr END
  WHERE code = 'vwks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Misty Glen' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCII Misty Glen Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3225 SW Randolph Ave; Topeka, KS 66611' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3225 SW Randolph Ave; Topeka, KS 66611' ELSE owner_notice_addr END
  WHERE code = 'myks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fleming Court' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCIX Fleming Court, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1008 SW Fleming Court; Topeka, KS 66604' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1008 SW Fleming Court; Topeka, KS 66604' ELSE owner_notice_addr END
  WHERE code = 'ftks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Country Estates Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XLI Country Estates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3930 North 105th Street; Omaha, NE 68134' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3930 North 105th Street; Omaha, NE 68134' ELSE owner_notice_addr END
  WHERE code = 'cene';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Centre Ridge Apartment Homes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXVII Centre Ridge Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2940 Paddock Plaza; Omaha, NE 68124' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2940 Paddock Plaza; Omaha, NE 68124' ELSE owner_notice_addr END
  WHERE code = 'crne';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Georgetowne Apartment Homes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXVII Georgetowne Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2222 South 142nd Court; Omaha, NE 68144' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2222 South 142nd Court; Omaha, NE 68144' ELSE owner_notice_addr END
  WHERE code = 'gtne';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Park on Center' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXVII Park on Center Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2859 South 93rd Plaza; Omaha, NE 68124' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2859 South 93rd Plaza; Omaha, NE 68124' ELSE owner_notice_addr END
  WHERE code = 'pcne';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Pacific Winds' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXVII Pacific Winds Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1215 Fawn Parkway Plaza; Omaha, NE 68144' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1215 Fawn Parkway Plaza; Omaha, NE 68144' ELSE owner_notice_addr END
  WHERE code = 'pwne';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'West Haven Apartment Homes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXVII West Haven Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '288 N. 116th Plaza; Omaha, NE 68154' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '288 N. 116th Plaza; Omaha, NE 68154' ELSE owner_notice_addr END
  WHERE code = 'whne';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Grandridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXVI Grandridge LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5439 N 100th Plaza; Omaha, NE 68134' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5439 N 100th Plaza; Omaha, NE 68134' ELSE owner_notice_addr END
  WHERE code = 'grne';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Apache Trace' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG Apache Trace, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1301 East Highway 3; Guymon, OK 73942' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1301 East Highway 3; Guymon, OK 73942' ELSE owner_notice_addr END
  WHERE code = 'at';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Palo Duro Place' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LIX Palo Duro Place, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1025 South Virginia St; Amarillo, TX 79102' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1025 South Virginia St; Amarillo, TX 79102' ELSE owner_notice_addr END
  WHERE code = 'pdtx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Camelot' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LVIII Camelot LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2202 Harrison St; Wichita Falls, TX 76308' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2202 Harrison St; Wichita Falls, TX 76308' ELSE owner_notice_addr END
  WHERE code = 'catx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Country Club Villas' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXIX COUNTRY CLUB VILLAS, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4401 South Coulter; Amarillo, TX 79109' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4401 South Coulter; Amarillo, TX 79109' ELSE owner_notice_addr END
  WHERE code = 'cctx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Summit on the Lake' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXVIII Summit, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6555 Shady Oaks Manor Drive; Fort Worth, TX 76135' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6555 Shady Oaks Manor Drive; Fort Worth, TX 76135' ELSE owner_notice_addr END
  WHERE code = 'sltx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'River Ranch (San Angelo)' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXX San Angelo, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4225 S Jackson Street; San Angelo, TX 76903' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4225 S Jackson Street; San Angelo, TX 76903' ELSE owner_notice_addr END
  WHERE code = 'satx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Mill Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXV Mill Creek, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5249 US HWY 277 South; Abilene, TX 79605' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5249 US HWY 277 South; Abilene, TX 79605' ELSE owner_notice_addr END
  WHERE code = 'mctx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Country Club Villas Abilene' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXIX Abilene CCV, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4450 Ridgemont Drive; Abilene, TX 79606' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4450 Ridgemont Drive; Abilene, TX 79606' ELSE owner_notice_addr END
  WHERE code = 'cttx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Dominion' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXIX Dominion Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5501 50th Street; Lubbock, TX 79414' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5501 50th Street; Lubbock, TX 79414' ELSE owner_notice_addr END
  WHERE code = 'tdtx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXIX Park Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5702 50th street; Lubbock, TX 79414' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5702 50th street; Lubbock, TX 79414' ELSE owner_notice_addr END
  WHERE code = 'tptx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Summer Brook' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXI SB Longview Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2300 Bill Owens Parkway; Longview, TX 75604' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2300 Bill Owens Parkway; Longview, TX 75604' ELSE owner_notice_addr END
  WHERE code = 'sbtx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Summer Green' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXI SG Longview Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '110 E Hawkins Parkway; Longview, TX 75605' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '110 E Hawkins Parkway; Longview, TX 75605' ELSE owner_notice_addr END
  WHERE code = 'sgtx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Southgate' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLIX Southgate Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '14 A Merry Ln; Greenville, NC 27858' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '14 A Merry Ln; Greenville, NC 27858' ELSE owner_notice_addr END
  WHERE code = 'sgnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Madison' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLIX Madison Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2221 Hyde Dr; Greenville, NC 27858' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2221 Hyde Dr; Greenville, NC 27858' ELSE owner_notice_addr END
  WHERE code = 'tmnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Willow Run' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLII Willow Run, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '157 Treetop Drive; Fayetteville, NC 28311' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '157 Treetop Drive; Fayetteville, NC 28311' ELSE owner_notice_addr END
  WHERE code = 'wrnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Colony Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXVII Colony Village, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3301 Brunswick Ave; New Bern, NC 28562' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3301 Brunswick Ave; New Bern, NC 28562' ELSE owner_notice_addr END
  WHERE code = 'cvnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Tartan Place' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXIII Tartan Place, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'PHYSICAL:  401 Tartan Court  ///     SHIP TO: 157 Treetop Drive; Fayetteville, NC 28311' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'PHYSICAL:  401 Tartan Court  ///     SHIP TO: 157 Treetop Drive; Fayetteville, NC 28311' ELSE owner_notice_addr END
  WHERE code = 'tpnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Forest Hills' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXVIII Forest Hills Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '505 Alpine Drive; Wilmington, NC 28403' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '505 Alpine Drive; Wilmington, NC 28403' ELSE owner_notice_addr END
  WHERE code = 'fhnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXVIII Creek Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2247 Wrightsville Avenue; Wilmington, NC 28403' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2247 Wrightsville Avenue; Wilmington, NC 28403' ELSE owner_notice_addr END
  WHERE code = 'tcnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Park Apartment Homes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXVII The Park Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6230 Abbotts Park Drive; Fayetteville, NC 28311' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6230 Abbotts Park Drive; Fayetteville, NC 28311' ELSE owner_notice_addr END
  WHERE code = 'pknc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Junction at Ramsey & Carver' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXVII The Junction Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6271 Carver Oaks Drive; Fayetteville, NC 28311' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6271 Carver Oaks Drive; Fayetteville, NC 28311' ELSE owner_notice_addr END
  WHERE code = 'tjnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Landing Apartment Homes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXVII The Landing Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '581 Abbotts Landing Drive; Fayetteville, NC 28314' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '581 Abbotts Landing Drive; Fayetteville, NC 28314' ELSE owner_notice_addr END
  WHERE code = 'tlnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Residences at Forestdale' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCV Residences at Forestdale, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3551-C Forestdale Dr; Burlington, NC 27215' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3551-C Forestdale Dr; Burlington, NC 27215' ELSE owner_notice_addr END
  WHERE code = 'rfnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Cole' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLIX Cole, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '812 Crescent Commons Way; Fayetteville, NC 28314' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '812 Crescent Commons Way; Fayetteville, NC 28314' ELSE owner_notice_addr END
  WHERE code = 'clnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Parcstone' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCL PARCSTONE SUB, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5101 ParcStone Ln; Fayetteville, NC 28314' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5101 ParcStone Ln; Fayetteville, NC 28314' ELSE owner_notice_addr END
  WHERE code = 'psnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Stone Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCL STONE RIDGE SUB, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3001 Stone Carriage Cir; Fayetteville, NC 28304' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3001 Stone Carriage Cir; Fayetteville, NC 28304' ELSE owner_notice_addr END
  WHERE code = 'srnc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Pine Grove' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCII Pine Grove Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '408 Foxfire Drive; Columbia, SC 29212' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '408 Foxfire Drive; Columbia, SC 29212' ELSE owner_notice_addr END
  WHERE code = 'pgsc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Quail Hollow' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCII Quail Hollow Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2700 Feather Run Trail; West Columbia, SC 29169' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2700 Feather Run Trail; West Columbia, SC 29169' ELSE owner_notice_addr END
  WHERE code = 'qhsc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Wildewood South' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCII Wildewood South Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '127 Sparkleberry Lane; Columbia, SC 29229' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '127 Sparkleberry Lane; Columbia, SC 29229' ELSE owner_notice_addr END
  WHERE code = 'wssc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'West Winds' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCII West Winds Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '105 Hillpine Road; Columbia, SC 29212' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '105 Hillpine Road; Columbia, SC 29212' ELSE owner_notice_addr END
  WHERE code = 'wwsc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Northgate' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XVI Associates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2330 N Samson Way; Waukegan, IL 60087' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2330 N Samson Way; Waukegan, IL 60087' ELSE owner_notice_addr END
  WHERE code = 'ng';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fox Crest' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXIV Fox Crest Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2805 W Glen Flora; Waukegan, IL 60085' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2805 W Glen Flora; Waukegan, IL 60085' ELSE owner_notice_addr END
  WHERE code = 'fcil';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Harbor Lake' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXIV Harbor Lake Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1610 Sunset Avenue; Waukegan, IL 60087' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1610 Sunset Avenue; Waukegan, IL 60087' ELSE owner_notice_addr END
  WHERE code = 'hlil';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Reserve at Eagle Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLVI Reserve at Eagle Ridge, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1947 West Eagle Ridge Drive; Waukegan, IL 60087' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1947 West Eagle Ridge Drive; Waukegan, IL 60087' ELSE owner_notice_addr END
  WHERE code = 'eril';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Gates of Rochester' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXXVII Gates of Rochester, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2015 41ST ST NW; Rochester, MN 55901' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2015 41ST ST NW; Rochester, MN 55901' ELSE owner_notice_addr END
  WHERE code = 'grmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Crystal Bay' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXV Crystal Bay Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3908 19th Ave NW; Rochester, MN 55901' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3908 19th Ave NW; Rochester, MN 55901' ELSE owner_notice_addr END
  WHERE code = 'cbmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'French Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXV French Creek Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3908 19th Ave NW; Rochester, MN 55901' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3908 19th Ave NW; Rochester, MN 55901' ELSE owner_notice_addr END
  WHERE code = 'fcmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Heritage Manor' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXV Heritage Manor Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2408 18 1/2 Ave NW; Rochester, MN 55901' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2408 18 1/2 Ave NW; Rochester, MN 55901' ELSE owner_notice_addr END
  WHERE code = 'hmmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Olympik Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXV Olympik Village Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '402 31st St NE; Rochester, MN 55906' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '402 31st St NE; Rochester, MN 55906' ELSE owner_notice_addr END
  WHERE code = 'ovmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Winchester' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXV Winchester Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3908 19th Ave NW; Rochester, MN 55901' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3908 19th Ave NW; Rochester, MN 55901' ELSE owner_notice_addr END
  WHERE code = 'wcmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fordem Towers' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXX Fordem Towers Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1622 Fordem Avenue; Madison, WI 53704' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1622 Fordem Avenue; Madison, WI 53704' ELSE owner_notice_addr END
  WHERE code = 'ftwi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Rivers Edge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXX Rivers Edge Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1614 Fordem Avenue; Madison, WI 53704' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1614 Fordem Avenue; Madison, WI 53704' ELSE owner_notice_addr END
  WHERE code = 'rewi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Sun Valley' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXV Sun Valley, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3620 Breckenridge Ct; Fitchburg, WI 53713' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3620 Breckenridge Ct; Fitchburg, WI 53713' ELSE owner_notice_addr END
  WHERE code = 'svwi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN '21 South at Parkview' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXL 21 South, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4944 South Sherwood Forest Blvd; Baton Rouge, LA 70816' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4944 South Sherwood Forest Blvd; Baton Rouge, LA 70816' ELSE owner_notice_addr END
  WHERE code = 'tsla';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Dove Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLIV Dove Creek Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '10920 Airline Highway; Baton Rouge, LA 70816' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '10920 Airline Highway; Baton Rouge, LA 70816' ELSE owner_notice_addr END
  WHERE code = 'dcla';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Longridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLIV Longridge Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '11999 Longridge Ave; Baton Rouge, LA 70816' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '11999 Longridge Ave; Baton Rouge, LA 70816' ELSE owner_notice_addr END
  WHERE code = 'lrla';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Afton Oaks' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXIV Afton Oaks LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '12074 Newcastle Ave; Baton Rouge, LA 70816' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '12074 Newcastle Ave; Baton Rouge, LA 70816' ELSE owner_notice_addr END
  WHERE code = 'aola';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Chestnut Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXIX Chestnut Ridge, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '8686 Coy Ave; Baton Rouge, LA 70810' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '8686 Coy Ave; Baton Rouge, LA 70810' ELSE owner_notice_addr END
  WHERE code = 'crla';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Village at Juban Lakes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCVIII Village at Juban Lakes, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '11000 Buddy Ellis Road; Denham Springs, LA 70726' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '11000 Buddy Ellis Road; Denham Springs, LA 70726' ELSE owner_notice_addr END
  WHERE code = 'jlla';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Mountaineer Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Mountaineer Village Associates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '720 North Colorado Street; Gunnison, CO 81230' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '720 North Colorado Street; Gunnison, CO 81230' ELSE owner_notice_addr END
  WHERE code = 'mv';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Mesa Gardens' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Mesa Gardens Associates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2207 E 12th St; Pueblo, CO 81001' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2207 E 12th St; Pueblo, CO 81001' ELSE owner_notice_addr END
  WHERE code = 'mg';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Ramblewood' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Ramblewood Apartments Associates III, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '155 Briarwood Rd; Fort Collins, CO 80521' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '155 Briarwood Rd; Fort Collins, CO 80521' ELSE owner_notice_addr END
  WHERE code = 'rw';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Pines at Southmoor' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XIV Associates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2162 30th St; Greeley, CO 80631' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2162 30th St; Greeley, CO 80631' ELSE owner_notice_addr END
  WHERE code = 'ps';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Village Green' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXXIV Village Green LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1213 26th Ave; Greeley, CO 80634' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1213 26th Ave; Greeley, CO 80634' ELSE owner_notice_addr END
  WHERE code = 'vgco';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Mesa Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Mesa Ridge Apartments, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3501 Atrisco Dr NW; Albuquerque, NM 87120' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3501 Atrisco Dr NW; Albuquerque, NM 87120' ELSE owner_notice_addr END
  WHERE code = 'mr';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'La Vida Buena' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'La Vida Buena Apartments, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2201 Ambassador Road NE; Albuquerque, NM 87112' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2201 Ambassador Road NE; Albuquerque, NM 87112' ELSE owner_notice_addr END
  WHERE code = 'lv';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Mission Hill' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Mission Hill Associates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '10000 Menaul Blvd NE; Albuquerque, NM 87112' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '10000 Menaul Blvd NE; Albuquerque, NM 87112' ELSE owner_notice_addr END
  WHERE code = 'mh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Wyoming Place' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Wyoming Place Associates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5222 Wyoming Blvd NE; Albuquerque, NM 87111' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5222 Wyoming Blvd NE; Albuquerque, NM 87111' ELSE owner_notice_addr END
  WHERE code = 'wy';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Sedona Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXVI Sedona Ridge, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3400 Wyoming Blvd; Albuquerque, NM 87111' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3400 Wyoming Blvd; Albuquerque, NM 87111' ELSE owner_notice_addr END
  WHERE code = 'srnm';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Homestead' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLVII Homestead, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2100 E Settlers Pass; Hobbs, NM 88240' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2100 E Settlers Pass; Hobbs, NM 88240' ELSE owner_notice_addr END
  WHERE code = 'hsnm';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Avalon at Carlsbad' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CL Avalon at Carlsbad, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1907 San Jose Blvd; Carlsbad, NM 88220' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1907 San Jose Blvd; Carlsbad, NM 88220' ELSE owner_notice_addr END
  WHERE code = 'acnm';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Saddlecreek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXI Saddlecreek, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1901 S. Sunset Avenue; Roswell, NM 88203' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1901 S. Sunset Avenue; Roswell, NM 88203' ELSE owner_notice_addr END
  WHERE code = 'scnm';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Hearth Hollow' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CI Hearth Hollow Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '200 S. Woodlawn Blvd; Derby, KS 67037' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '200 S. Woodlawn Blvd; Derby, KS 67037' ELSE owner_notice_addr END
  WHERE code = 'hhks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Mt. Carmel Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CI MT Carmel Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3000 W Douglas Ave; Wichita, KS 67203' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3000 W Douglas Ave; Wichita, KS 67203' ELSE owner_notice_addr END
  WHERE code = 'mcks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Brookwood' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXII Brookwood Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1770 S Rock Rd; Wichita, KS 67207' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1770 S Rock Rd; Wichita, KS 67207' ELSE owner_notice_addr END
  WHERE code = 'bwks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Club at Cherry Hills' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXII Cherry Hills Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2200 S Rock Rd; Wichita, KS 67207' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2200 S Rock Rd; Wichita, KS 67207' ELSE owner_notice_addr END
  WHERE code = 'chks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Eastgate' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXX Eastgate Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '632 S Eastern St; Wichita, KS 67207' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '632 S Eastern St; Wichita, KS 67207' ELSE owner_notice_addr END
  WHERE code = 'egks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'High Point East' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXX High Point East Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '9400 E Lincoln St; Wichita, KS 67207' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '9400 E Lincoln St; Wichita, KS 67207' ELSE owner_notice_addr END
  WHERE code = 'hpks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Morgans Landing' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXX Morgans Landing Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3801 W 13th St N; Wichita, KS 67203' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3801 W 13th St N; Wichita, KS 67203' ELSE owner_notice_addr END
  WHERE code = 'mgks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Northridge Crossing' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXX Northridge Crossing Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '507 E Northview Road; McPherson, KS 67460' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '507 E Northview Road; McPherson, KS 67460' ELSE owner_notice_addr END
  WHERE code = 'ncks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Springcreek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXX Springcreek Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1804 E Osage Road; Derby, KS 67037' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1804 E Osage Road; Derby, KS 67037' ELSE owner_notice_addr END
  WHERE code = 'scks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Indian Hills Apartment Homes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCII Indian Hills Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2740 W 13th St.; Wichita, KS 67203' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2740 W 13th St.; Wichita, KS 67203' ELSE owner_notice_addr END
  WHERE code = 'ihks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'MacArthurs Lake' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCII MacArthur Lake Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '727 W MacArthur Rd.; Wichita, KS 67217' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '727 W MacArthur Rd.; Wichita, KS 67217' ELSE owner_notice_addr END
  WHERE code = 'maks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Ponderosa' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCII Ponderosa Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5900 E Mainsgate Rd.; Wichita, KS 67220' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5900 E Mainsgate Rd.; Wichita, KS 67220' ELSE owner_notice_addr END
  WHERE code = 'prks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Redbud Twin Homes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCII Twin Homes at Redbud Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Ship to: ATTN: Office 7003 W. 34th St. N. Wichita, KS 67205  // Physical Address: 635 N. Redbud Ave. Valley Center, KS 67205; Valley Center, KS 67147' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Ship to: ATTN: Office 7003 W. 34th St. N. Wichita, KS 67205  // Physical Address: 635 N. Redbud Ave. Valley Center, KS 67205; Valley Center, KS 67147' ELSE owner_notice_addr END
  WHERE code = 'rbks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Ridgeport' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCII Ridgeport Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '7003 W 34th St. N; Wichita, KS 67205' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '7003 W 34th St. N; Wichita, KS 67205' ELSE owner_notice_addr END
  WHERE code = 'rpks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Westborough Arms' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCII Westborough Arms Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '9301 W Central Ave.; Wichita, KS 67212' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '9301 W Central Ave.; Wichita, KS 67212' ELSE owner_notice_addr END
  WHERE code = 'waks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Berkshire' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXII Berkshire Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '8820 W Westlawn St; Wichita, KS 67212' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '8820 W Westlawn St; Wichita, KS 67212' ELSE owner_notice_addr END
  WHERE code = 'brks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Cross Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXII Cross Creek Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '7750 E 32ND St N; Wichita, KS 67226' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '7750 E 32ND St N; Wichita, KS 67226' ELSE owner_notice_addr END
  WHERE code = 'crks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fox Run' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXVI Fox Run, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1157 S. Webb Rd; Wichita, KS 67207' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1157 S. Webb Rd; Wichita, KS 67207' ELSE owner_notice_addr END
  WHERE code = 'foks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Shoreline Landing' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XIX Associates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '959 Flette St; Norton Shores, MI 49441' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '959 Flette St; Norton Shores, MI 49441' ELSE owner_notice_addr END
  WHERE code = 'slmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Crown Pointe' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMGXXXVII Crown Pointe Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1180 Matt Urban Dr; Holland, MI 49423' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1180 Matt Urban Dr; Holland, MI 49423' ELSE owner_notice_addr END
  WHERE code = 'crmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Eastland' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXXVII Eastland Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4243 Forest Creek Ct SE; Kentwood, MI 49512' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4243 Forest Creek Ct SE; Kentwood, MI 49512' ELSE owner_notice_addr END
  WHERE code = 'elmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Tiffany Woods' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XLII Tiffany Woods, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3298 Roosevelt Road; Muskegon, MI 49441' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3298 Roosevelt Road; Muskegon, MI 49441' ELSE owner_notice_addr END
  WHERE code = 'twmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Hidden Cove' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LVII Hidden Cove LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3975 Grand Haven Rd; Norton Shores, MI 49441' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3975 Grand Haven Rd; Norton Shores, MI 49441' ELSE owner_notice_addr END
  WHERE code = 'hcmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Rolling Pines' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LVII Rolling Pines, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4650 Ramswood Drive NE; Grand Rapids, MI 49525' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4650 Ramswood Drive NE; Grand Rapids, MI 49525' ELSE owner_notice_addr END
  WHERE code = 'rpmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Drakes Pond' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXVI Drakes Pond, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '555 South Drake Road; Kalamazoo, MI 49009' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '555 South Drake Road; Kalamazoo, MI 49009' ELSE owner_notice_addr END
  WHERE code = 'dpmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Woodland Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXVIII WOODLAND RIDGE, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '18270 Woodland Ridge Dr; Spring Lake, MI 49456' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '18270 Woodland Ridge Dr; Spring Lake, MI 49456' ELSE owner_notice_addr END
  WHERE code = 'wrmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Forest Pointe (FKA Castle Bluff)' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXVII Castle Bluff, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2810 32nd St SE; Grand Rapids, MI 49512' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2810 32nd St SE; Grand Rapids, MI 49512' ELSE owner_notice_addr END
  WHERE code = 'cbmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Old Farm Shores' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXVIII Old Farm Shores, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2122 Sandy Shore Drive SE; Kentwood, MI 49508' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2122 Sandy Shore Drive SE; Kentwood, MI 49508' ELSE owner_notice_addr END
  WHERE code = 'ofmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Bronco Club' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XCV Bronco Club, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3201 Michigamme Woods Drive; Kalamazoo, MI 49006' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3201 Michigamme Woods Drive; Kalamazoo, MI 49006' ELSE owner_notice_addr END
  WHERE code = 'bcmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lakecrest' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXIII Lakecrest Properties Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2850 Cleveland Avenue; St Joseph, MI 49085' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2850 Cleveland Avenue; St Joseph, MI 49085' ELSE owner_notice_addr END
  WHERE code = 'lcmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Shores of Roosevelt Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXIII Shores of Roosevelt Park Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3050 Maple Grove Road; Muskegon, MI 49441' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3050 Maple Grove Road; Muskegon, MI 49441' ELSE owner_notice_addr END
  WHERE code = 'srmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Tourville North' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLVIII Tourville Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '910 Lincoln Ave; Marquette, MI 49855' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '910 Lincoln Ave; Marquette, MI 49855' ELSE owner_notice_addr END
  WHERE code = 'tvmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Northwoods' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLVIII Marquette Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '910 Lincoln Ave; Marquette, MI 49855' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '910 Lincoln Ave; Marquette, MI 49855' ELSE owner_notice_addr END
  WHERE code = 'nrmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Arcadia Grove' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXVI Arcadia Grove, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1324 Lafayette Ave; Kalamazoo, MI 49006' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1324 Lafayette Ave; Kalamazoo, MI 49006' ELSE owner_notice_addr END
  WHERE code = 'agmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Emerald Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXX Emerald Creek' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2516 Crossing Circle; Traverse City, MI 49684' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2516 Crossing Circle; Traverse City, MI 49684' ELSE owner_notice_addr END
  WHERE code = 'ecmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Westview' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXC Westview, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2702 Lakeshore Drive; St. Joseph, MI 49085' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2702 Lakeshore Drive; St. Joseph, MI 49085' ELSE owner_notice_addr END
  WHERE code = 'wvmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Huntington Glen' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCVIII Huntington Glen, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3242 Huntington Woods Drive SE; Kentwood, MI 49512' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3242 Huntington Woods Drive SE; Kentwood, MI 49512' ELSE owner_notice_addr END
  WHERE code = 'hgmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lamberton Lake' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXVII Lamberton Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3118 1/2 Plaza Drive NE; Grand Rapids, MI 49525' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3118 1/2 Plaza Drive NE; Grand Rapids, MI 49525' ELSE owner_notice_addr END
  WHERE code = 'lami';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Plaza' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXVII Plaza Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3118 1/2 Plaza Dr NE; Grand Rapids, MI 49525' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3118 1/2 Plaza Dr NE; Grand Rapids, MI 49525' ELSE owner_notice_addr END
  WHERE code = 'tpmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Vantage Point' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXI VANTAGE POINT, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2300 Rebsamen Park Road; Little Rock, AR 72202' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2300 Rebsamen Park Road; Little Rock, AR 72202' ELSE owner_notice_addr END
  WHERE code = 'vpar';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fairfield' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXIII Fairfield Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1912 Green Mountain Drive; Little Rock, AR 72212' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1912 Green Mountain Drive; Little Rock, AR 72212' ELSE owner_notice_addr END
  WHERE code = 'ffar';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Berkley' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXIII Berkley Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1601 N Shackleford; Little Rock, AR 72211' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1601 N Shackleford; Little Rock, AR 72211' ELSE owner_notice_addr END
  WHERE code = 'tbar';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Beacon Hill' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXVII Beacon Hill, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1801 Reservoir Rd; Little Rock, AR 72227' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1801 Reservoir Rd; Little Rock, AR 72227' ELSE owner_notice_addr END
  WHERE code = 'bhar';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Pecan Grove' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVI PECAN GROVE SUB, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4335 Clubhouse Drive; Alexandria, LA 71303' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4335 Clubhouse Drive; Alexandria, LA 71303' ELSE owner_notice_addr END
  WHERE code = 'pgla';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Rosewood' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVI ROSEWOOD SUB LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4051 Bayou Rapides Road; Alexandria, LA 71303' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4051 Bayou Rapides Road; Alexandria, LA 71303' ELSE owner_notice_addr END
  WHERE code = 'rwla';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Acadian Point' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCIX Acadian Point, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '221 Verot School Road; Lafayette, LA 70508' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '221 Verot School Road; Lafayette, LA 70508' ELSE owner_notice_addr END
  WHERE code = 'apla';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Granite Valley' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XVII, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6741 C Ave NE; Cedar Rapids, IA 52402' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6741 C Ave NE; Cedar Rapids, IA 52402' ELSE owner_notice_addr END
  WHERE code = 'gva';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Hamptons at Coral Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XVIII, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2260 10th Street; Coralville, IA 52241' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2260 10th Street; Coralville, IA 52241' ELSE owner_notice_addr END
  WHERE code = 'hcr';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Valley Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXIA Sioux IA Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2951 Park Ave; Sioux City, IA 51104' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2951 Park Ave; Sioux City, IA 51104' ELSE owner_notice_addr END
  WHERE code = 'vpia';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Alexandra' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXVI Alexandra, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4419 1st Ave SW; Cedar Rapids, IA 52405' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4419 1st Ave SW; Cedar Rapids, IA 52405' ELSE owner_notice_addr END
  WHERE code = 'alia';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Indian Hills' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLVII Indian Hills Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3915 Winona Way; Sioux City, IA 51104' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3915 Winona Way; Sioux City, IA 51104' ELSE owner_notice_addr END
  WHERE code = 'ihia';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Ridge Oaks' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLVII Ridge Oaks Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2300 Indian Hills Dr. ; Sioux City, IA 51104' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2300 Indian Hills Dr. ; Sioux City, IA 51104' ELSE owner_notice_addr END
  WHERE code = 'roia';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Retreat on 6th' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXII Retreat on 6th, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2981 6th St SW; Cedar Rapids, IA 52404' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2981 6th St SW; Cedar Rapids, IA 52404' ELSE owner_notice_addr END
  WHERE code = 'tria';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Overlook 380' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXIII Overlook 380, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2040 Glass Road NE; Cedar Rapids, IA 52402' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2040 Glass Road NE; Cedar Rapids, IA 52402' ELSE owner_notice_addr END
  WHERE code = 'o3ia';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'East Edge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXIII East Edge, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2201 Gibson St; Sioux City, IA 51106' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2201 Gibson St; Sioux City, IA 51106' ELSE owner_notice_addr END
  WHERE code = 'eeia';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Pheasant Run' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXIV Pheasant Run, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '470 Quail Ct SW; Cedar Rapids, IA 52404' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '470 Quail Ct SW; Cedar Rapids, IA 52404' ELSE owner_notice_addr END
  WHERE code = 'pria';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'LeClaire' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXX LECLAIRE, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '421 19th Street; Moline, IL 61265' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '421 19th Street; Moline, IL 61265' ELSE owner_notice_addr END
  WHERE code = 'lcil';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Village Woods' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXIV Village Woods, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '300 W 20th Ave; Milan, IL 61264' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '300 W 20th Ave; Milan, IL 61264' ELSE owner_notice_addr END
  WHERE code = 'vwil';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Huntley Ridge New Albany' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'FAE Holdings 470167R III, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2313 Grant Line Road; New Albany, IN 47150' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2313 Grant Line Road; New Albany, IN 47150' ELSE owner_notice_addr END
  WHERE code = 'hain';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Huntley Ridge Clarksville' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'FAE Holdings 470167R II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '813 Eastern Boulevard; Clarksville, IN 47129' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '813 Eastern Boulevard; Clarksville, IN 47129' ELSE owner_notice_addr END
  WHERE code = 'hcin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Huntley Ridge Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Huntley Ridge Louisville II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '790 Irving Dr; Clarksville, IN 47129' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '790 Irving Dr; Clarksville, IN 47129' ELSE owner_notice_addr END
  WHERE code = 'htin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Olde Towne Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'FAE Holdings 470167R IV, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '790 Irving Dr.; Clarksville, IN 47129' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '790 Irving Dr.; Clarksville, IN 47129' ELSE owner_notice_addr END
  WHERE code = 'otin';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Preston Oaks' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXX Preston Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1214 Gilmore Lane; Louisville, KY 40213' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1214 Gilmore Lane; Louisville, KY 40213' ELSE owner_notice_addr END
  WHERE code = 'poky';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Icon' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXVI Icon, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3201 Leith Lane; Louisville, KY 40218' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3201 Leith Lane; Louisville, KY 40218' ELSE owner_notice_addr END
  WHERE code = 'icky';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Interstate' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXIB Sioux NE Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1610 C Street; South Sioux City, NE 68776' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1610 C Street; South Sioux City, NE 68776' ELSE owner_notice_addr END
  WHERE code = 'iane';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Arbors' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLVII Arbors Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1000 E 17th St. ; South Sioux City, NE 68776' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1000 E 17th St. ; South Sioux City, NE 68776' ELSE owner_notice_addr END
  WHERE code = 'arne';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Chelsea Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXVI Chelsea Park, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '25900 Chelsea Park Dr; Taylor, MI 48180' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '25900 Chelsea Park Dr; Taylor, MI 48180' ELSE owner_notice_addr END
  WHERE code = 'cpmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Gateway Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXX Gateway Townhomes, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '15001 Brandt St; Romulus, MI 48174' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '15001 Brandt St; Romulus, MI 48174' ELSE owner_notice_addr END
  WHERE code = 'gwmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Ashton Pines' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Ashton Pines II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '7380 Arbor Trail; Waterford, MI 48327' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '7380 Arbor Trail; Waterford, MI 48327' ELSE owner_notice_addr END
  WHERE code = 'apmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lancaster Lakes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Lancaster Lakes II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5147 Lancaster Hills Dr.; Clarkston, MI 48346' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5147 Lancaster Hills Dr.; Clarkston, MI 48346' ELSE owner_notice_addr END
  WHERE code = 'llmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fairlane East' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XCII FAIRLANE EAST, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '16055 Knollwood Drive; Dearborn, MI 48120' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '16055 Knollwood Drive; Dearborn, MI 48120' ELSE owner_notice_addr END
  WHERE code = 'femi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Heights' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XCIX The Heights, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1545 E 13 Mile Road; Madison Heights, MI 48071' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1545 E 13 Mile Road; Madison Heights, MI 48071' ELSE owner_notice_addr END
  WHERE code = 'thmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Waterford West' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXI Waterford West, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '7380 Arbor Trail; Waterford Township, MI 48327' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '7380 Arbor Trail; Waterford Township, MI 48327' ELSE owner_notice_addr END
  WHERE code = 'wwmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fox Hill Glens' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXI Fox Hill Glens LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2168 Fox Hill Drive; Grand Blanc, MI 48439' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2168 Fox Hill Drive; Grand Blanc, MI 48439' ELSE owner_notice_addr END
  WHERE code = 'fhmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Stonehenge Gates' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXI Stonehenge Gates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1171 Ramsgate Road; Flint, MI 48532' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1171 Ramsgate Road; Flint, MI 48532' ELSE owner_notice_addr END
  WHERE code = 'sgmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fountain Pointe' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXI Fountain Pointe LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6033 Fountain Pointe; Grand Blanc, MI 48439' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6033 Fountain Pointe; Grand Blanc, MI 48439' ELSE owner_notice_addr END
  WHERE code = 'tlmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Rising Estates' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXX Rising Estates Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '304 Milford Court; Davison, MI 48423' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '304 Milford Court; Davison, MI 48423' ELSE owner_notice_addr END
  WHERE code = 'remi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Pine Lake Manor' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCIII Pine Lake Manor, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3271 Christopher Ln; Keego Harbor, MI 48320' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3271 Christopher Ln; Keego Harbor, MI 48320' ELSE owner_notice_addr END
  WHERE code = 'plmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Chateau Riviera' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCIII Chateau Riviera, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '22316 La Seine; Southfield, MI 48075' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '22316 La Seine; Southfield, MI 48075' ELSE owner_notice_addr END
  WHERE code = 'ctmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Gateway of Grand Blanc' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXI Gateway of Grand Blanc, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5220 E. Baldwin Rd.; Holly, MI 48442' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5220 E. Baldwin Rd.; Holly, MI 48442' ELSE owner_notice_addr END
  WHERE code = 'gbmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Miller West' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXX Miller West, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'G-3100 Miller Road; Flint, MI 48507' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'G-3100 Miller Road; Flint, MI 48507' ELSE owner_notice_addr END
  WHERE code = 'mwmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Silver Lake Hills' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXII Silver Lake Hills, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3200 Foley Glen Drive; Fenton, MI 48430' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3200 Foley Glen Drive; Fenton, MI 48430' ELSE owner_notice_addr END
  WHERE code = 'svmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Valley Stream' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XX Associates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6400 Glenhurst Dr; Maumee, OH 43537' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6400 Glenhurst Dr; Maumee, OH 43537' ELSE owner_notice_addr END
  WHERE code = 'vsoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'LaSalle' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXII LaSalle, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '513 Adams Street; Toledo, OH 43604' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '513 Adams Street; Toledo, OH 43604' ELSE owner_notice_addr END
  WHERE code = 'lsoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Brookeville' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Brainerd Road Associates BVSPE, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6851 Sharon Court; Columbus, OH 43229' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6851 Sharon Court; Columbus, OH 43229' ELSE owner_notice_addr END
  WHERE code = 'tboh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Georgetown Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Georgetown Village I Owner B LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3045 Ilger Avenue; Toledo, OH 43606' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3045 Ilger Avenue; Toledo, OH 43606' ELSE owner_notice_addr END
  WHERE code = 'gvoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Hunters Ridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Hunters Ridge Property Owner B, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3406 Gibralter Heights Drive; Toledo, OH 43609' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3406 Gibralter Heights Drive; Toledo, OH 43609' ELSE owner_notice_addr END
  WHERE code = 'hroh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Whispering Timbers' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Triple Generations Investment CO. II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6325 Garden Rd; Maumee, OH 43537' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6325 Garden Rd; Maumee, OH 43537' ELSE owner_notice_addr END
  WHERE code = 'tioh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Clair Commons' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXVII Clair Commons, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2844 Airport Hwy Unit C; Toledo, OH 43609' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2844 Airport Hwy Unit C; Toledo, OH 43609' ELSE owner_notice_addr END
  WHERE code = 'cmoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lexington Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Lexington Park Holdings II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2255 Country Corner Dr; Columbus, OH 43220' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2255 Country Corner Dr; Columbus, OH 43220' ELSE owner_notice_addr END
  WHERE code = 'lxoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Edge at Arlington' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Leeman Associates II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5028 Dierker Rd; Columbus, OH 43220' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5028 Dierker Rd; Columbus, OH 43220' ELSE owner_notice_addr END
  WHERE code = 'eaoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Retreat at Mill Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVIII Mill Creek Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '8714 Pflumm Court; Lenexa, KS 66215' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '8714 Pflumm Court; Lenexa, KS 66215' ELSE owner_notice_addr END
  WHERE code = 'mlks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Retreat at Woodridge' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVIII Woodridge Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '13245 W. 87th Terrace; Lenexa, KS 66215' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '13245 W. 87th Terrace; Lenexa, KS 66215' ELSE owner_notice_addr END
  WHERE code = 'wrks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Grant 79' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLIV Grant 79, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '9213 W. 79th Street; Overland Park, KS 66204' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '9213 W. 79th Street; Overland Park, KS 66204' ELSE owner_notice_addr END
  WHERE code = 'grks';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Oaks At Prairie View' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LI The Oaks, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '8031 NW Milrey Dr; Kansas City, MO 64152' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '8031 NW Milrey Dr; Kansas City, MO 64152' ELSE owner_notice_addr END
  WHERE code = 'tomo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Retreat at Walnut Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LVI WCMO, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1300 NE Parvin Rd; Kansas City, MO 64116' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1300 NE Parvin Rd; Kansas City, MO 64116' ELSE owner_notice_addr END
  WHERE code = 'wcmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Prairie Walk' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXIII Prairie Walk, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '11026 College Lane; Kansas City, MO 64137' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '11026 College Lane; Kansas City, MO 64137' ELSE owner_notice_addr END
  WHERE code = 'pwmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Hills' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXII THE HILLS, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '525 NW 55th Terrace; Kansas City, MO 64118' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '525 NW 55th Terrace; Kansas City, MO 64118' ELSE owner_notice_addr END
  WHERE code = 'thmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Retreat at Woodlands' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVIII Woodlands Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '510 E 101st Street; Kansas City, MO 64131' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '510 E 101st Street; Kansas City, MO 64131' ELSE owner_notice_addr END
  WHERE code = 'wlmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Forest Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXV Forest Park Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4623 NE Winn Road; Kansas City, MO 64117' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4623 NE Winn Road; Kansas City, MO 64117' ELSE owner_notice_addr END
  WHERE code = 'fpmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'NoRi' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXXI NORI, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '735 NW 60th Street; Kansas City, MO 64118' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '735 NW 60th Street; Kansas City, MO 64118' ELSE owner_notice_addr END
  WHERE code = 'nomo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Arbors of Grandview' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXVIII Arbors of Grandview, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6731 East 119th Street; Grandview, MO 64030' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6731 East 119th Street; Grandview, MO 64030' ELSE owner_notice_addr END
  WHERE code = 'agmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Commons & Landing at Southgate' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXI Commons Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'SHIP TO: ATTN: OFFICE  1909 31st Ave SW  Minot, ND 58701. Physical Address 1909 31st Ave SW; Minot, ND 58701' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'SHIP TO: ATTN: OFFICE  1909 31st Ave SW  Minot, ND 58701. Physical Address 1909 31st Ave SW; Minot, ND 58701' ELSE owner_notice_addr END
  WHERE code = 'clnd';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'South Pointe' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXI South Pointe Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1301 31st Ave SW #108; Minot, ND 58701' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1301 31st Ave SW #108; Minot, ND 58701' ELSE owner_notice_addr END
  WHERE code = 'spnd';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Chateau' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXI Chateau Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1725 2nd Ave SW Minot, ND 58701; Minot, ND 58701' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1725 2nd Ave SW Minot, ND 58701; Minot, ND 58701' ELSE owner_notice_addr END
  WHERE code = 'tcnd';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Wyatt at Northern Lights' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLVIII The Wyatt Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1410 30th Ave NW; Minot, ND 58703' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1410 30th Ave NW; Minot, ND 58703' ELSE owner_notice_addr END
  WHERE code = 'wynd';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Reserve at Bison Crossing' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLIV Bison Crossing Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1418 42nd St W; Williston, ND 58801' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1418 42nd St W; Williston, ND 58801' ELSE owner_notice_addr END
  WHERE code = 'bcnd';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Reserve at Elk Crossing' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLIV Elk Crossing Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2015 32nd St W #101; Williston, ND 58801' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2015 32nd St W #101; Williston, ND 58801' ELSE owner_notice_addr END
  WHERE code = 'ecnd';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Walnut Creek' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XLIV Walnut  Creek, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6827 Shenandoah Drive; Florence, KY 41042' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6827 Shenandoah Drive; Florence, KY 41042' ELSE owner_notice_addr END
  WHERE code = 'wcky';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Castle Pointe' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Brandywine Creek II, LLC (DBA Castle Pointe)' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3075 Endenhall Way; East Lansing, MI 48823' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3075 Endenhall Way; East Lansing, MI 48823' ELSE owner_notice_addr END
  WHERE code = 'cami';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lakewood' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Michigan Properties III, LLC (DBA Lakewood Apartments)' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5731 Ridgeway Dr.; Haslett, MI 48840' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5731 Ridgeway Dr.; Haslett, MI 48840' ELSE owner_notice_addr END
  WHERE code = 'lwmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Nemoke Trails' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXIV Nemoke Trails Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1765 Nemoke Trail; Haslett, MI 48840' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1765 Nemoke Trail; Haslett, MI 48840' ELSE owner_notice_addr END
  WHERE code = 'ntmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Hamilton Trace' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CV HAMILTON TRACE, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1846 Hamilton Road; Okemos, MI 48864' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1846 Hamilton Road; Okemos, MI 48864' ELSE owner_notice_addr END
  WHERE code = 'htmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Burwick Farms' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CIX Burwick Farms, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '525 West Highland Road; Howell, MI 48843' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '525 West Highland Road; Howell, MI 48843' ELSE owner_notice_addr END
  WHERE code = 'bfmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Hidden Tree' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXX Hidden Tree LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '410 Pine Forest Dr. ; East Lansing, MI 48823' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '410 Pine Forest Dr. ; East Lansing, MI 48823' ELSE owner_notice_addr END
  WHERE code = 'hemi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lansing Houses' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLVI Lansing Houses Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '229 N Pine St, 233-35 N Pine St, 617 W Ionia St, 221 N Pine St; Lansing, MI 48933' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '229 N Pine St, 233-35 N Pine St, 617 W Ionia St, 221 N Pine St; Lansing, MI 48933' ELSE owner_notice_addr END
  WHERE code = 'lhmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lansing Towers' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLVI Lansing Tower Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '610 W. Ottawa St; Lansing, MI 48933' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '610 W. Ottawa St; Lansing, MI 48933' ELSE owner_notice_addr END
  WHERE code = 'ltmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Villages at Symmes Crossing' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Sycamore Creek Apartments II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '12131 Sycamore Terrace Dr.; Cincinnati, OH 45249' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '12131 Sycamore Terrace Dr.; Cincinnati, OH 45249' ELSE owner_notice_addr END
  WHERE code = 'scoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Arbor Pointe' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Arbor Pointe Apartments II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '100 Buckhead Dr.; Fairfield, OH 45014' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '100 Buckhead Dr.; Fairfield, OH 45014' ELSE owner_notice_addr END
  WHERE code = 'apoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lakota Lake' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Lakota Lake II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6757 Lakeside Dr.; West Chester, OH 45069' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6757 Lakeside Dr.; West Chester, OH 45069' ELSE owner_notice_addr END
  WHERE code = 'lloh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Highlands of West Chester' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Fountains Apts. II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6615 Fountains Blvd; West Chester, OH 45069' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6615 Fountains Blvd; West Chester, OH 45069' ELSE owner_notice_addr END
  WHERE code = 'thoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Carriage Hill' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'CS Carriage Hill II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1344 Carriage Hill Ln.; Hamilton, OH 45013' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1344 Carriage Hill Ln.; Hamilton, OH 45013' ELSE owner_notice_addr END
  WHERE code = 'choh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Waterstone Place' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Waterstone Place II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '11365 Lippelman Rd.; Cincinnati, OH 45246' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '11365 Lippelman Rd.; Cincinnati, OH 45246' ELSE owner_notice_addr END
  WHERE code = 'wsoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Riverwalk' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLI Riverwalk Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '115 Perry St; Grand Ledge, MI 48837' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '115 Perry St; Grand Ledge, MI 48837' ELSE owner_notice_addr END
  WHERE code = 'rwmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Bloomfield Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLI Bloomfield Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1695 Bloomfield Drive SE; Grand Rapids, MI 49508' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1695 Bloomfield Drive SE; Grand Rapids, MI 49508' ELSE owner_notice_addr END
  WHERE code = 'blmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Pinehurst Townhomes' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLI Pinehurst Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '220 W Saginaw Hwy; Grand Ledge, MI 48837' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '220 W Saginaw Hwy; Grand Ledge, MI 48837' ELSE owner_notice_addr END
  WHERE code = 'phmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Preserve at Woodland' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXVI Preserve Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2351 Valleywood Drive SE; Grand Rapids, MI 49546' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2351 Valleywood Drive SE; Grand Rapids, MI 49546' ELSE owner_notice_addr END
  WHERE code = 'pwmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Springbrook Flats' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXVI Springbrook Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2352 Springbrook Parkway SE; Grand Rapids, MI 49546' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2352 Springbrook Parkway SE; Grand Rapids, MI 49546' ELSE owner_notice_addr END
  WHERE code = 'sfmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Brick Lofts at Historic West Tech High' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXXVI West Tech Lofts, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2201 W 93rd St; Cleveland, OH 44102' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2201 W 93rd St; Cleveland, OH 44102' ELSE owner_notice_addr END
  WHERE code = 'wtoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Cedarwood Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Cedarwood Village Apartments, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1343 Weathervane Lane; Akron, OH 44313' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1343 Weathervane Lane; Akron, OH 44313' ELSE owner_notice_addr END
  WHERE code = 'cwoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Eastwood Arms' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Eastwood Arms Apartments II, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4 Arms Blvd.; Niles, OH 44446' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4 Arms Blvd.; Niles, OH 44446' ELSE owner_notice_addr END
  WHERE code = 'ewoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Depot' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXVIII The Depot, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '80 E Exchange St. ; Akron, OH 44308' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '80 E Exchange St. ; Akron, OH 44308' ELSE owner_notice_addr END
  WHERE code = 'tdoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Tanglewood' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLIII Tanglewood, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '815 E Grandview Blvd; Erie, PA 16504' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '815 E Grandview Blvd; Erie, PA 16504' ELSE owner_notice_addr END
  WHERE code = 'tapa';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Eden Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXXII Eden Park, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6455 Zane Ave N; Brooklyn Park, MN 55429' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6455 Zane Ave N; Brooklyn Park, MN 55429' ELSE owner_notice_addr END
  WHERE code = 'epmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Stone Grove' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXXVIII Stone Grove, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2525 Williams Dr; Burnsville, MN 55337' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2525 Williams Dr; Burnsville, MN 55337' ELSE owner_notice_addr END
  WHERE code = 'sgmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'City Limits' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XLVIII City Limits, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '127 E 59th St; Minneapolis, MN 55419' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '127 E 59th St; Minneapolis, MN 55419' ELSE owner_notice_addr END
  WHERE code = 'clmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Les Chateaux' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CII Les Chateaux, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3780 London Road; Duluth, MN 55804' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3780 London Road; Duluth, MN 55804' ELSE owner_notice_addr END
  WHERE code = 'lcmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Fountains in the Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLIII Fountains in the Park, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5700 73rd Ave N; Brooklyn Park, MN 55429' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5700 73rd Ave N; Brooklyn Park, MN 55429' ELSE owner_notice_addr END
  WHERE code = 'fpmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Upper Town' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLI Upper Town, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1310 15th Street N APT 2; Saint Cloud, MN 56303' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1310 15th Street N APT 2; Saint Cloud, MN 56303' ELSE owner_notice_addr END
  WHERE code = 'utmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Sterling Square' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXIV STERLING SQUARE SUB LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'SHIP TO: 6455 Zane Ave N, Brooklyn Park MN 55429; PHYSICAL: 6640 N. Humboldt Avenue; Brooklyn Center, MN 55430' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'SHIP TO: 6455 Zane Ave N, Brooklyn Park MN 55429; PHYSICAL: 6640 N. Humboldt Avenue; Brooklyn Center, MN 55430' ELSE owner_notice_addr END
  WHERE code = 'ssmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'West Broadway' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXIV WEST BROADWAY SUB LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'SHIP TO: 6455 Zane Ave N, Brooklyn Park MN 55429; PHYSICAL: 6624 W Broadway Ave; Brooklyn Park, MN 55428' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'SHIP TO: 6455 Zane Ave N, Brooklyn Park MN 55429; PHYSICAL: 6624 W Broadway Ave; Brooklyn Park, MN 55428' ELSE owner_notice_addr END
  WHERE code = 'wbmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Gatewood' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXIV Gatewood Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '813 7th Street South; Waite Park, MN 56387' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '813 7th Street South; Waite Park, MN 56387' ELSE owner_notice_addr END
  WHERE code = 'gwmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Legacy of Waite Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXIV Legacy Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '248 3rd Street S. Suite 100B; Waite Park, MN 56387' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '248 3rd Street S. Suite 100B; Waite Park, MN 56387' ELSE owner_notice_addr END
  WHERE code = 'lymn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Park Meadows' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXIV Park Meadows Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '408 Park Meadows Dr; Waite Park, MN 56387' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '408 Park Meadows Dr; Waite Park, MN 56387' ELSE owner_notice_addr END
  WHERE code = 'pmmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Pointe West' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXIV Pointe West Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3225 Maine Prairie Road; St. Cloud, MN 56301' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3225 Maine Prairie Road; St. Cloud, MN 56301' ELSE owner_notice_addr END
  WHERE code = 'pwmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Windsor Gates' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXV Windsor Gates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6200 78th Ave North; Brooklyn Park, MN 55443' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6200 78th Ave North; Brooklyn Park, MN 55443' ELSE owner_notice_addr END
  WHERE code = 'wgmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Oaks at Bentonshire' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLI Oaks at Bentonshire, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1540 East Highway 23 #108; St Cloud, MN 56304' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1540 East Highway 23 #108; St Cloud, MN 56304' ELSE owner_notice_addr END
  WHERE code = 'obmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Abbey Run' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Toledo Properties Owner B, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2200 W. Alexis Road, Suite A; Toledo, OH 43613' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2200 W. Alexis Road, Suite A; Toledo, OH 43613' ELSE owner_notice_addr END
  WHERE code = 'aroh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Miracle Manor' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Miracle Manor Property Owner B, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2200 W. Alexis Road, Suite A; Toledo, OH 43613' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2200 W. Alexis Road, Suite A; Toledo, OH 43613' ELSE owner_notice_addr END
  WHERE code = 'mmoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Sunnydale Estates' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Sunnydale Estates Property Owner B, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2200 W. Alexis Road, Suite A; Toledo, OH 43613' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2200 W. Alexis Road, Suite A; Toledo, OH 43613' ELSE owner_notice_addr END
  WHERE code = 'seoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Crossings at Remington' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXII Crossings Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1130 Cleveland Rd; Sandusky, OH 44870' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1130 Cleveland Rd; Sandusky, OH 44870' ELSE owner_notice_addr END
  WHERE code = 'croh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Foxborough Commons' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXII Foxborough Sub LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1130 Cleveland Rd; Sandusky, OH 44870' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1130 Cleveland Rd; Sandusky, OH 44870' ELSE owner_notice_addr END
  WHERE code = 'fcoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'River Oaks' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MBR River Oaks Apartments, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5425 E. Paris Avenue SE; Kentwood, MI 49512' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5425 E. Paris Avenue SE; Kentwood, MI 49512' ELSE owner_notice_addr END
  WHERE code = 'romi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Meadows of Coon Rapids' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'CMC 1 Meadows of Coon Rapids, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1770 121st Ave NW; Coon Rapids, MN 55448' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1770 121st Ave NW; Coon Rapids, MN 55448' ELSE owner_notice_addr END
  WHERE code = 'mdmn';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'New Fountains' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'CMC 2 The New Fountains, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5401 Williamsburg Way; Fitchburg, WI 53719' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5401 Williamsburg Way; Fitchburg, WI 53719' ELSE owner_notice_addr END
  WHERE code = 'nfwi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Country Club (OH)' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'LC Country Club B, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1130 Pine Valley Lane; Toledo, OH 43615' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1130 Pine Valley Lane; Toledo, OH 43615' ELSE owner_notice_addr END
  WHERE code = 'ccoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Timber Ridge Abilene' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Abilene Timber Ridge Apartments, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3602 Rolling Green Drive; Abilene, TX 79606' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3602 Rolling Green Drive; Abilene, TX 79606' ELSE owner_notice_addr END
  WHERE code = 'trtx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Seasons on Chelsea' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'CMC 4 Seasons on Chelsea, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2530 Chelsea Dr.; Fort Mitchell, KY 41017' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2530 Chelsea Dr.; Fort Mitchell, KY 41017' ELSE owner_notice_addr END
  WHERE code = 'scky';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Forest Woods' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'CMC 5 Forest Woods LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '101 Forest Parkway; Valley Park, MO 63088' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '101 Forest Parkway; Valley Park, MO 63088' ELSE owner_notice_addr END
  WHERE code = 'fwmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Ashton Pointe' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'CMC 6 Ashton Pointe, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '308 Frankford Ave; Lubbock, TX 79416' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '308 Frankford Ave; Lubbock, TX 79416' ELSE owner_notice_addr END
  WHERE code = 'attx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Centerville Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Centerville Park Apartments III, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2050 Sidneywood Road; West Carrollton, OH 45449' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2050 Sidneywood Road; West Carrollton, OH 45449' ELSE owner_notice_addr END
  WHERE code = 'cvoh';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Ridge at Chestnut' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Ridge at Chestnut, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '8701 Chestnut Cir.; Kansas City, MO 64131' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '8701 Chestnut Cir.; Kansas City, MO 64131' ELSE owner_notice_addr END
  WHERE code = 'trmo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Earl' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'PMF Gainesville 77, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '124 Southwest 62nd Street; Gainesville, FL 32607' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '124 Southwest 62nd Street; Gainesville, FL 32607' ELSE owner_notice_addr END
  WHERE code = 'tefl';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Harmony Lake' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLVI Harmony Lake, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1700 Harmony Lk Dr; Muskegon, MI 49444' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1700 Harmony Lk Dr; Muskegon, MI 49444' ELSE owner_notice_addr END
  WHERE code = 'hlmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lexington Court' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLVIII Lexington Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1450 Yeomans Road; Abilene, TX 79602' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1450 Yeomans Road; Abilene, TX 79602' ELSE owner_notice_addr END
  WHERE code = 'lctx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Reserve at Abilene' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLVIII Reserve Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3649 Cedar Run Road; Abilene, TX 79606' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3649 Cedar Run Road; Abilene, TX 79606' ELSE owner_notice_addr END
  WHERE code = 'ratx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Residence at Heritage Park' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLVIII Heritage Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2789 E Lake Road; Abilene, TX 79601' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2789 E Lake Road; Abilene, TX 79601' ELSE owner_notice_addr END
  WHERE code = 'rhtx';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lakeview Estates' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Lakeview Estates, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '824 Lakeview Drive; Parkersburg, WV 26104' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '824 Lakeview Drive; Parkersburg, WV 26104' ELSE owner_notice_addr END
  WHERE code = 'lvwv';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Oakwood Village' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'Oakwood Village, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2503 Beverly St; Parkersburg, WV 26101' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2503 Beverly St; Parkersburg, WV 26101' ELSE owner_notice_addr END
  WHERE code = 'ovwv';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Eagle Grove' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLIX Grand Woods, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2619 Kalamazoo Ave Se; Grand Rapids, MI 49507' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2619 Kalamazoo Ave Se; Grand Rapids, MI 49507' ELSE owner_notice_addr END
  WHERE code = 'gdmi';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fair Hills' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLX Fair Hills Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2829 27th St W; Williston, ND 58801' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2829 27th St W; Williston, ND 58801' ELSE owner_notice_addr END
  WHERE code = 'fhnd';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Plantation at Hunters Run' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLX Plantation Sub, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3410 5th Ave NE; Watford City, ND 58854' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3410 5th Ave NE; Watford City, ND 58854' ELSE owner_notice_addr END
  WHERE code = 'phnd';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Sioux City Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXI Sioux Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Properties; Sioux City, NE' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Properties; Sioux City, NE' ELSE owner_notice_addr END
  WHERE code = 'siouxllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Dayton Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXVIII HS Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Properties; Dayton, OH' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Properties; Dayton, OH' ELSE owner_notice_addr END
  WHERE code = 'dayton';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Grand Rapids Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXXVII CE Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Properties; Grand Rapids, MI' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Properties; Grand Rapids, MI' ELSE owner_notice_addr END
  WHERE code = 'grandr';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Hidden Cove and Rolling Pines Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LVII HR Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Properties; Multiple Cities, MI 49441' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Properties; Multiple Cities, MI 49441' ELSE owner_notice_addr END
  WHERE code = 'hrllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Michigan 6 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXIV MI6 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6 Properties; Multiple, MI' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6 Properties; Multiple, MI' ELSE owner_notice_addr END
  WHERE code = 'mi6llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Omaha 5 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXVII Omaha Five, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5 Properties; Omaha, NE' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5 Properties; Omaha, NE' ELSE owner_notice_addr END
  WHERE code = 'om5llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Waukegan 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXIV Waukegan Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Properties; Waukegan, IL' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Properties; Waukegan, IL' ELSE owner_notice_addr END
  WHERE code = 'waukllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Saint Louis 3 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XCVIII ST LOUIS 3 MASTER LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3 Properties; St. Louis, MO' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3 Properties; St. Louis, MO' ELSE owner_notice_addr END
  WHERE code = 'stl3llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Wichita 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CI Wichita 2 Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Properties; Wichita, KS 67203' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Properties; Wichita, KS 67203' ELSE owner_notice_addr END
  WHERE code = 'wichita';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Alexandria 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVI ALEXANDRIA 2 LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Alexandria, LA 71303' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Alexandria, LA 71303' ELSE owner_notice_addr END
  WHERE code = 'alexllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'South County Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVII South County Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; St. Louis, MO 63128' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; St. Louis, MO 63128' ELSE owner_notice_addr END
  WHERE code = 'socollc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Kansas City 3' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CVII KC3 Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3 Locations; Kansas City, KS 66215' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3 Locations; Kansas City, KS 66215' ELSE owner_notice_addr END
  WHERE code = 'kc3llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Toledo 5 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXIV Toledo 5 LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5 Locations; Toledo, OH 43613' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5 Locations; Toledo, OH 43613' ELSE owner_notice_addr END
  WHERE code = 'toledo';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Kansas City 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXV KC2 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Kansas City, MO 64117' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Kansas City, MO 64117' ELSE owner_notice_addr END
  WHERE code = 'kc2llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Madison 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXX Madison Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Madison, WI 53704' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Madison, WI 53704' ELSE owner_notice_addr END
  WHERE code = 'madison';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Genesee 3 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXI Genesee Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3 Locations; Genesee County, MI' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3 Locations; Genesee County, MI' ELSE owner_notice_addr END
  WHERE code = 'genesee';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Wichita Rock Road Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXII Wichita RR Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Wichita, KS 67207' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Wichita, KS 67207' ELSE owner_notice_addr END
  WHERE code = 'wicrrllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lakeshore Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXIII Lakeshore Portfolio Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Muskegon & St Joseph, MI' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Muskegon & St Joseph, MI' ELSE owner_notice_addr END
  WHERE code = 'lakellc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Midwest 4 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXVII Midwest 4 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4 Locations; St. Louis, MO 63128' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4 Locations; St. Louis, MO 63128' ELSE owner_notice_addr END
  WHERE code = 'midwest4';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lubbock 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXIX LUBBOCK MASTER LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Lubbock, TX 79414' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Lubbock, TX 79414' ELSE owner_notice_addr END
  WHERE code = 'lubbock';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Louisville 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXX Louisville Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Louisville; Louisville, KY 40213' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Louisville; Louisville, KY 40213' ELSE owner_notice_addr END
  WHERE code = 'louisllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Jackson 5 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLII Jackson 5 Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '24 Williamsburg Village Drive; Jackson, TN 38305' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '24 Williamsburg Village Drive; Jackson, TN 38305' ELSE owner_notice_addr END
  WHERE code = 'jack5llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Michigan Grand Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLI Grand Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3 Locations; Grand Ledge and Kentwood, MI 49331' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3 Locations; Grand Ledge and Kentwood, MI 49331' ELSE owner_notice_addr END
  WHERE code = 'migrdllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Ohio 3 BW CP CW Master Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXXXVIII BV CP CW Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Ohio; Akron, Bedford Heights, Middletown, OH 44146' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Ohio; Akron, Bedford Heights, Middletown, OH 44146' ELSE owner_notice_addr END
  WHERE code = 'ohio3llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Greenville Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXLIX Greenville Master' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Greenville, NC 27858' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Greenville, NC 27858' ELSE owner_notice_addr END
  WHERE code = 'gvllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Little Rock 2 (formerly Little Rock 4)' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG LXXXIII LR2 LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4 Properties; Little Rock, AR' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4 Properties; Little Rock, AR' ELSE owner_notice_addr END
  WHERE code = 'lr2llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Baton Rouge 2' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLIV Baton Rouge Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Baton Rouge, LA 70816' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Baton Rouge, LA 70816' ELSE owner_notice_addr END
  WHERE code = 'brllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Topeka 5 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLV Topeka 5 Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2745 SW Villa West Dr; Topeka, KS 66614' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2745 SW Villa West Dr; Topeka, KS 66614' ELSE owner_notice_addr END
  WHERE code = 'topeka';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Riverside 4 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLVI Riverside 4 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4 Locations; Clarksville & New Albany, IN 47129' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4 Locations; Clarksville & New Albany, IN 47129' ELSE owner_notice_addr END
  WHERE code = 'riverllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Sioux 3 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLVII Sioux City 3 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3 Locations; Sioux City, NE' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3 Locations; Sioux City, NE' ELSE owner_notice_addr END
  WHERE code = 'sioux3';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'North County 4 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLX NOCO 4 Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4 Locations; St. Louis, MO' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4 Locations; St. Louis, MO' ELSE owner_notice_addr END
  WHERE code = 'noco4';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Tourville Marquette Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLVIII Tourville Marquette Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Marquette, MI 49855' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Marquette, MI 49855' ELSE owner_notice_addr END
  WHERE code = 'tvmqllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Longview 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXI Longview Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Longview, TX 75604' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Longview, TX 75604' ELSE owner_notice_addr END
  WHERE code = 'longllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fraze 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXIII Fraze Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Dayton/Fairborn, OH 45324' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Dayton/Fairborn, OH 45324' ELSE owner_notice_addr END
  WHERE code = 'frazellc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Wichita 5 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXX Wichita 5 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5 Locations; Wichita, KS 67203' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5 Locations; Wichita, KS 67203' ELSE owner_notice_addr END
  WHERE code = 'wich5llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'NE Dayton 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXVI NE Dayton 2 Master LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Dayton, OH' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Dayton, OH' ELSE owner_notice_addr END
  WHERE code = 'dayton2';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fayetteville 3 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXVII Fayetteville 3 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '3 Locations; Fayetteville, NC' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '3 Locations; Fayetteville, NC' ELSE owner_notice_addr END
  WHERE code = 'fv3llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'MI OH Basic Value Add Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XXXI Camelot Place LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4 Locations; Michigan and Ohio, MI 48423' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4 Locations; Michigan and Ohio, MI 48423' ELSE owner_notice_addr END
  WHERE code = 'mivapllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Sandusky 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXII Sandusky 2 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Sandusky, OH 44870' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Sandusky, OH 44870' ELSE owner_notice_addr END
  WHERE code = 'sand2llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Brooklyn 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CLXXXIV BROOKLYN 2 MASTER LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '6624 W Broadway Ave & 6640 N Humboldt; Brooklyn Park, MN 55430' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '6624 W Broadway Ave & 6640 N Humboldt; Brooklyn Park, MN 55430' ELSE owner_notice_addr END
  WHERE code = 'brookllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Rochester Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG XLIX Timber Ridge LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '5 Locations; Rochester, MN' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '5 Locations; Rochester, MN' ELSE owner_notice_addr END
  WHERE code = 'rochllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Kansas 8 (Wichita & Topeka)' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCII Kansas 8 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2740 W 13th St; Wichita, KS 67203' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2740 W 13th St; Wichita, KS 67203' ELSE owner_notice_addr END
  WHERE code = 'kansas8';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Terre Haute Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CXCV Terre Haute Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1200 E Elmwood Dr; Terre Haute, IN 47802' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1200 E Elmwood Dr; Terre Haute, IN 47802' ELSE owner_notice_addr END
  WHERE code = 'thllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Columbia 4' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCII Columbia 4 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '4 Locations; Columbia, SC' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '4 Locations; Columbia, SC' ELSE owner_notice_addr END
  WHERE code = 'columllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'GR 342 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXVI Kent County 2 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '2 Locations; Grand Rapids, MI 49546' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '2 Locations; Grand Rapids, MI 49546' ELSE owner_notice_addr END
  WHERE code = 'kent2llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'GR 152 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXVII Lamberton Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'multiple locations; Grand Rapids, MI 49525' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'multiple locations; Grand Rapids, MI 49525' ELSE owner_notice_addr END
  WHERE code = 'lambllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Wichita North 2 Master' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXII Wichita North 2 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Multiple addresses; Wichita, KS 67212' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Multiple addresses; Wichita, KS 67212' ELSE owner_notice_addr END
  WHERE code = 'wicn2llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Evansville 3' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXIII Evansville 3 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Multiple Addresses; Evansville, IN 47715' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Multiple Addresses; Evansville, IN 47715' ELSE owner_notice_addr END
  WHERE code = 'evan3llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'St Cloud Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXIV St Cloud 4 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'multiple addresses; St. Cloud, MN 56387' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'multiple addresses; St. Cloud, MN 56387' ELSE owner_notice_addr END
  WHERE code = 'stcloud4';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'The Minot 4 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXXXI Minot 4 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN '1909 31st Ave SW; Minot, ND 58701' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN '1909 31st Ave SW; Minot, ND 58701' ELSE owner_notice_addr END
  WHERE code = 'minot4';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Western Kentucky 2 Master' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLV Western Kentucky 2 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Multiple Addresses; Owensboro, KY 42303' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Multiple Addresses; Owensboro, KY 42303' ELSE owner_notice_addr END
  WHERE code = 'wky2llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Lansing Tower Master' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCXLVI Lansing Tower Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Multiple Addresses; Lansing, MI 48933' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Multiple Addresses; Lansing, MI 48933' ELSE owner_notice_addr END
  WHERE code = 'lansllc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Fayetteville II Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCL Fayetteville 2 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Multiple Addresses; Fayetteville, NC 28314' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Multiple Addresses; Fayetteville, NC 28314' ELSE owner_notice_addr END
  WHERE code = 'fv2llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Williston 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLIV Williston 2 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Multiple Addresses; Williston, ND 58801' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Multiple Addresses; Williston, ND 58801' ELSE owner_notice_addr END
  WHERE code = 'will2llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Abilene 3' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLVIII Abilene 3 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Abilene TX; Abilene, TX 79601' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Abilene TX; Abilene, TX 79601' ELSE owner_notice_addr END
  WHERE code = 'abilene3';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Parkersburg 2' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLVII Parkersburg 2 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Multiple Addresses; Parkersburg, WV 26104' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Multiple Addresses; Parkersburg, WV 26104' ELSE owner_notice_addr END
  WHERE code = 'park2llc';
UPDATE properties SET
  name = CASE WHEN name IS NULL OR name = '' THEN 'Basin 2 Portfolio' ELSE name END,
  owner_entity = CASE WHEN owner_entity IS NULL OR owner_entity = '' THEN 'MIMG CCLX Basin 2 Master, LLC' ELSE owner_entity END,
  address = CASE WHEN address IS NULL OR address = '' THEN 'Multiple Addresses; Williston, ND 58801' ELSE address END,
  owner_notice_addr = CASE WHEN owner_notice_addr IS NULL OR owner_notice_addr = '' THEN 'Multiple Addresses; Williston, ND 58801' ELSE owner_notice_addr END
  WHERE code = 'basinllc';