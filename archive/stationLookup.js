var stationLookup = {  
    "Acton Town":"ACT",
    "South Kensington":"SKS",
    "Covent Garden":"CGN",
    "Edgware Road (Circle Line)":"ERC",
    "Edgware Road":"ERC",
    "Kilburn":"KBN",
    "Gants Hill":"GTH",
    "Edgware":"EGW",
    "Euston":"EUS",
    "West Hampstead":"WHP",
    "Old Street":"ODS",
    "Woodford":"WOF",
    "Woodford Junction":"WOF",
    "Westminster":"WSM",
    "Tooting Broadway":"TBY",
    "Uxbridge":"UXB",
    "Baker Street":"BST",
    "Brixton":"BXN",
    "Aldgate East":"ADE",
    "Canada Water":"CWR",
    "Barons Court":"BSC",
    "Chancery Lane":"CHL",
    "Highbury & Islington":"HAI",
    "Canons Park":"CPK",
    "Boston Manor":"BOS",
    "Barbican":"BBN",
    "Dollis Hill":"DOH",
    "East Acton":"EAN",
    "Green Park":"GPK",
    "Seven Sisters":"SVS",
    "Brent Cross":"BTX",
    "Ealing Common":"ECM",
    "Earl's Court":"ECT",
    "Camden Town":"CTN",
    "Neasden":"NDN",
    "Paddington":"PAC",
    "Hanger Lane":"HGR",
    "Charing Cross":"CHX",
    "Harrow-on-the-Hill":"HOH",
    "Clapham Common":"CPC",
    "Southwark":"SWK",
    "Regent's Park":"RGP",
    "Regents Park":"RGP",
    "Clapham South":"CPS",
    "Stonebridge Park":"SGP",
    "Warwick Avenue":"WKA",
    "Hillingdon":"HGD",
    "Elephant & Castle":"EAC",
    "Elephant and Castle":"EAC",
    "Elephant":"EAC",
    "North Harrow":"NHA",
    "Liverpool Street":"LVT",
    "Swiss Cottage":"SWC",
    "Holloway Road":"HWY",
    "Marble Arch":"MBA",
    "Monument":"MMT",
    "North Acton":"NAN",
    "North Acton Junction":"NAN",
    "Golders Green":"GGN",
    "Hyde Park Corner":"HPC",
    "Notting Hill Gate":"NHG",
    "High Barnet":"HBT",
    "King's Cross St. Pancras":"KSX",
    "Kings Cross":"KSX",
    "Kings Cross St. Pancras":"KSX",
    "King's Cross":"KSX",
    "Leicester Square":"LSQ",
    "Theydon Bois":"THB",
    "South Ealing":"SEA",
    "London Bridge":"LNB",
    "Wanstead":"WSD",
    "White City":"WCY",
    "Turnham Green":"TNG",
    "Woodside Park":"WOP",
    "Blackfriars":"BKF",
    "Gloucester Road":"GTR",
    "Bank":"BNK",
    "Waterloo":"WLO",
    "Blackhorse Road":"BLR",
    "Bermondsey":"BMY",
    "Alperton":"ALP",
    "Edgware Road (Bakerloo)":"ERB",
    "Bethnal Green":"BLG",
    "Bond Street":"BND",
    "Buckhurst Hill":"BKH",
    "Finsbury Park":"FPK",
    "Canary Wharf":"CYF",
    "Aldgate":"ALD",
    "Harlesden":"HSN",
    "Amersham":"AMS",
    "Archway":"ACY",
    "Kensal Green":"KSL",
    "Cannon Street":"CST",
    "Ealing Broadway":"EBY",
    "Caledonian Road":"CAR",
    "Finchley Road":"FYR",
    "Belsize Park":"BZP",
    "Chorleywood":"CYD",
    "Dagenham East":"DGE",
    "Lambeth North":"LBN",
    "Lambeth":"LBN",
    "Pimlico":"PCO",
    "Maida Vale":"MVL",
    "Marylebone":"MYB",
    "Stockwell":"SKW",
    "Grange Hill":"GGH",
    "North Wembley":"NWY",
    "Farringdon":"FCN",
    "Vauxhall":"VXL",
    "Oxford Circus":"OXC",
    "East Ham":"EHM",
    "Hainault":"HLT",
    "Chalk Farm":"CFM",
    "Piccadilly Circus":"PCC",
    "Queensbury":"QBY",
    "Queen's Park":"QPS",
    "Embankment":"EMB",
    "Hammersmith (Dist&Picc Line)":"HSD",
    "Hammersmith":"HSD",
    "St. John's Wood":"SJW",
    "St. Johns Wood":"SJW",
    "St. John Wood":"SJW",
    "Lancaster Gate":"LGT",
    "Hammersmith (H&C Line)":"HSC",
    "Colindale":"CND",
    "Hatton Cross":"HNX",
    "Stanmore":"STM",
    "Colliers Wood":"CSD",
    "East Finchley":"EFY",
    "High Street Kensington":"HSK",
    "Leytonstone":"LYS",
    "Heathrow Terminals 1-2-3":"HRC",
    "Heathrow Terminal 1":"HRC",
    "Heathrow Terminal 2":"HRC",
    "Heathrow Terminal 3":"HRC",
    "Wembley Central":"WYC",
    "Stratford":"STD",
    "Moorgate":"MGT",
    "Hornchurch":"HCH",
    "Willesden Junction":"WJN",
    "Northwick Park":"NKP",
    "Mansion House":"MSH",
    "Hounslow Central":"HWC",
    "Mile End":"MED",
    "Northwood Hills":"NWH",
    "Hounslow East":"HWE",
    "Wembley Park":"WYP",
    "Newbury Park":"NBP",
    "Hounslow West":"HWT",
    "Rickmansworth":"RKW",
    "Goodge Street":"GDG",
    "Watford":"WAF",
    "Willesden Green":"WIG",
    "Hampstead":"HTD",
    "West Harrow":"WHW",
    "Perivale":"PVL",
    "Hendon Central":"HCL",
    "Manor House":"MRH",
    "Redbridge":"RBG",
    "Northfields":"NFD",
    "Sloane Square":"SSQ",
    "Stamford Brook":"SFB",
    "Kennington":"KNG",
    "South Woodford":"SWF",
    "Kentish Town":"KSH",
    "Temple":"TMP",
    "Stepney Green":"SGN",
    "Rayners Lane":"RYL",
    "Upminster":"UPM",
    "Tottenham Court Road":"TCR",
    "Upney":"UPY",
    "Southgate":"SGT",
    "Victoria":"VIC",
    "West Ham":"WHM",
    "West Brompton":"WBN",
    "Oval":"OVL",
    "South Wimbledon":"SWN",
    "Tooting Bec":"TBC",
    "Turnpike Lane":"TPN",
    "Wimbledon":"WIM",
    "Totteridge & Whetstone":"TAW",
    "Tufnell Park":"TFP",
    "Barkingside":"BKE",
    "Barking":"BKG",
    "Eastcote":"EAE",
    "Ickenham":"ICK",
    "Holborn":"HBN",
    "Ruislip":"RSP",
    "Oakwood":"OAK",
    "Canning Town":"CGT",
    "Chalfont & Latimer":"CAL",
    "Epping":"EPG",
    "Holland Park":"HPK",
    "Heathrow Terminal 4":"HR4",
    "Richmond":"RMD",
    "Knightsbridge":"KNB",
    "Queensway":"QWY",
    "Highgate":"HGT",
    "Shepherd's Bush (Central)":"SBC",
    "Shepherd's Bush":"SBC",
    "West Kensington":"WKN",
    "Cockfosters":"CKS",
    "Great Portland Street":"GPS",
    "Heathrow Terminal 5":"HR5",
    "Arnos Grove":"ASG",
    "South Kenton":"SKT",
    "Gunnersbury":"GBY",
    "Northwood":"NOW",
    "Northolt":"NHT",
    "Ruislip Manor":"RSM",
    "Wood Green":"WOG",
    "St. James's Park":"SJP",
    "Arsenal":"ASL",
    "Angel":"AGL",
    "Chigwell":"CWL",
    "Harrow & Wealdstone":"HAW",
    "Bromley-by-Bow":"BBB",
    "Debden":"DBN",
    "Balham":"BLM",
    "Bounds Green":"BDS",
    "Kenton":"KEN",
    "Chiswick Park":"CWP",
    "Chesham":"CSM",
    "Kilburn Park":"KPK",
    "Croxley":"CXY",
    "Borough":"BOR",
    "Fairlop":"FLP",
    "Euston Square":"ESQ",
    "Burnt Oak":"BTK",
    "Kingsbury":"KBY",
    "Tottenham Hale":"TMH",
    "Greenford":"GFD",
    "North Greenwich":"NGW",
    "Walthamstow Central":"WWL",
    "Elm Park":"EPK",
    "Warren Street":"WRR",
    "Clapham North":"CPN",
    "Fulham Broadway":"FBY",
    "Leyton":"LYN",
    "Moor Park":"MPK",
    "Pinner":"PNR",
    "Parsons Green":"PSG",
    "Finchley Central":"FYC",
    "Plaistow":"PLW",
    "Putney Bridge":"PYB",
    "Ravenscourt Park":"RVP",
    "Paddington (H&C Line)":"PAH",
    "North Ealing":"NEN",
    "Roding Valley":"RVY",
    "Ruislip Gardens":"RSG",
    "Osterley":"OSY",
    "Snaresbrook":"SNB",
    "Park Royal":"PKR",
    "South Ruislip":"SRP",
    "St. Paul's":"SPU",
    "Tower Hill":"TWH",
    "Russell Square":"RSQ",
    "South Harrow":"SHH",
    "Upminster Bridge":"UPB",
    "Mill Hill East":"MHL",
    "West Acton":"WTA",
    "Morden":"MDN",
    "West Ruislip":"WRP",
    "Sudbury Hill":"SUH",
    "Sudbury Town":"SUT",
    "Mornington Crescent":"MTC",
    "Whitechapel":"WPL",
    "Wimbledon Park":"WIP",
    "West Finchley":"WFN",
    "East Putney":"EPY",
    "Southfields":"SFS",
    "Kew Gardens":"KWG",
    "Kensington (Olympia)":"KOY",
    "Shepherd's Bush Market":"SBM",
    "Bow Road":"BWR",
    "Upton Park":"UPK",
    "Dagenham Heathway":"DGY",
    "Bayswater":"BWT",
    "Latimer Road":"LRD",
    "Becontree":"BEC",
    "Goldhawk Road":"GHK",
    "Ladbroke Grove":"LAD",
    "Preston Road":"PRD",
    "Royal Oak":"RYO",
    "Westbourne Park":"WSP",
    "Wood Lane":"WLA",
    "Loughton":"LGN"
};