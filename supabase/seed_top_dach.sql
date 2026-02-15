-- Hoppersdiary seed: Topligen D-A-CH (50 Grounds)
-- Run in Supabase SQL Editor.
-- Note: This is a curated starter set (not guaranteed to match the exact current league season).

insert into public.grounds (name, club, city, country, league, slug, published)
values
  -- DE Bundesliga (18)
  ('Allianz Arena', 'FC Bayern München', 'München', 'DE', 'Bundesliga', 'allianz-arena-muenchen', true),
  ('Signal Iduna Park', 'Borussia Dortmund', 'Dortmund', 'DE', 'Bundesliga', 'signal-iduna-park-dortmund', true),
  ('BayArena', 'Bayer 04 Leverkusen', 'Leverkusen', 'DE', 'Bundesliga', 'bayarena-leverkusen', true),
  ('Red Bull Arena', 'RB Leipzig', 'Leipzig', 'DE', 'Bundesliga', 'red-bull-arena-leipzig', true),
  ('Deutsche Bank Park', 'Eintracht Frankfurt', 'Frankfurt am Main', 'DE', 'Bundesliga', 'deutsche-bank-park-frankfurt', true),
  ('MHPArena', 'VfB Stuttgart', 'Stuttgart', 'DE', 'Bundesliga', 'mhparena-stuttgart', true),
  ('Olympiastadion Berlin', 'Hertha BSC', 'Berlin', 'DE', 'Bundesliga', 'olympiastadion-berlin', true),
  ('Stadion an der Alten Försterei', '1. FC Union Berlin', 'Berlin', 'DE', 'Bundesliga', 'stadion-an-der-alten-foersterei-berlin', true),
  ('Volkswagen Arena', 'VfL Wolfsburg', 'Wolfsburg', 'DE', 'Bundesliga', 'volkswagen-arena-wolfsburg', true),
  ('MEWA Arena', '1. FSV Mainz 05', 'Mainz', 'DE', 'Bundesliga', 'mewa-arena-mainz', true),
  ('Europa-Park Stadion', 'SC Freiburg', 'Freiburg', 'DE', 'Bundesliga', 'europa-park-stadion-freiburg', true),
  ('Weserstadion', 'SV Werder Bremen', 'Bremen', 'DE', 'Bundesliga', 'weserstadion-bremen', true),
  ('RheinEnergieSTADION', '1. FC Köln', 'Köln', 'DE', 'Bundesliga', 'rheinenergiestadion-koeln', true),
  ('BORUSSIA-PARK', 'Borussia Mönchengladbach', 'Mönchengladbach', 'DE', 'Bundesliga', 'borussia-park-moenchengladbach', true),
  ('WWK ARENA', 'FC Augsburg', 'Augsburg', 'DE', 'Bundesliga', 'wwk-arena-augsburg', true),
  ('Vonovia Ruhrstadion', 'VfL Bochum', 'Bochum', 'DE', 'Bundesliga', 'vonovia-ruhrstadion-bochum', true),
  ('Millerntor-Stadion', 'FC St. Pauli', 'Hamburg', 'DE', 'Bundesliga', 'millerntor-stadion-hamburg', true),
  ('Holstein-Stadion', 'Holstein Kiel', 'Kiel', 'DE', 'Bundesliga', 'holstein-stadion-kiel', true),

  -- DE 2. Bundesliga (16)
  ('Volksparkstadion', 'Hamburger SV', 'Hamburg', 'DE', '2. Bundesliga', 'volksparkstadion-hamburg', true),
  ('VELTINS-Arena', 'FC Schalke 04', 'Gelsenkirchen', 'DE', '2. Bundesliga', 'veltins-arena-gelsenkirchen', true),
  ('Merkur Spiel-Arena', 'Fortuna Düsseldorf', 'Düsseldorf', 'DE', '2. Bundesliga', 'merkur-spiel-arena-duesseldorf', true),
  ('Heinz von Heiden Arena', 'Hannover 96', 'Hannover', 'DE', '2. Bundesliga', 'heinz-von-heiden-arena-hannover', true),
  ('Max-Morlock-Stadion', '1. FC Nürnberg', 'Nürnberg', 'DE', '2. Bundesliga', 'max-morlock-stadion-nuernberg', true),
  ('Fritz-Walter-Stadion', '1. FC Kaiserslautern', 'Kaiserslautern', 'DE', '2. Bundesliga', 'fritz-walter-stadion-kaiserslautern', true),
  ('Eintracht-Stadion', 'Eintracht Braunschweig', 'Braunschweig', 'DE', '2. Bundesliga', 'eintracht-stadion-braunschweig', true),
  ('Wildparkstadion', 'Karlsruher SC', 'Karlsruhe', 'DE', '2. Bundesliga', 'wildparkstadion-karlsruhe', true),
  ('SchücoArena', 'Arminia Bielefeld', 'Bielefeld', 'DE', '2. Bundesliga', 'schuecoarena-bielefeld', true),
  ('Bremer Brücke', 'VfL Osnabrück', 'Osnabrück', 'DE', '2. Bundesliga', 'bremer-bruecke-osnabrueck', true),
  ('MDCC-Arena', '1. FC Magdeburg', 'Magdeburg', 'DE', '2. Bundesliga', 'mdcc-arena-magdeburg', true),
  ('Home Deluxe Arena', 'SC Paderborn 07', 'Paderborn', 'DE', '2. Bundesliga', 'home-deluxe-arena-paderborn', true),
  ('Ostseestadion', 'Hansa Rostock', 'Rostock', 'DE', '2. Bundesliga', 'ostseestadion-rostock', true),
  ('Sportpark Ronhof | Thomas Sommer', 'SpVgg Greuther Fürth', 'Fürth', 'DE', '2. Bundesliga', 'sportpark-ronhof-fuerth', true),
  ('Ursapharm-Arena an der Kaiserlinde', 'SV Elversberg', 'Spiesen-Elversberg', 'DE', '2. Bundesliga', 'ursapharm-arena-kaiserlinde', true),
  ('Jahnstadion Regensburg', 'SSV Jahn Regensburg', 'Regensburg', 'DE', '2. Bundesliga', 'jahnstadion-regensburg', true),

  -- AT Bundesliga (10)
  ('Red Bull Arena', 'FC Red Bull Salzburg', 'Wals-Siezenheim', 'AT', 'Bundesliga', 'red-bull-arena-salzburg', true),
  ('Allianz Stadion', 'SK Rapid Wien', 'Wien', 'AT', 'Bundesliga', 'allianz-stadion-wien', true),
  ('Generali Arena', 'FK Austria Wien', 'Wien', 'AT', 'Bundesliga', 'generali-arena-wien', true),
  ('Raiffeisen Arena', 'LASK', 'Linz', 'AT', 'Bundesliga', 'raiffeisen-arena-linz', true),
  ('Merkur Arena', 'SK Sturm Graz', 'Graz', 'AT', 'Bundesliga', 'merkur-arena-graz', true),
  ('Wörthersee Stadion', 'SK Austria Klagenfurt', 'Klagenfurt', 'AT', 'Bundesliga', 'woerthersee-stadion-klagenfurt', true),
  ('Tivoli Stadion Tirol', 'WSG Tirol', 'Innsbruck', 'AT', 'Bundesliga', 'tivoli-stadion-tirol-innsbruck', true),
  ('NV Arena', 'SKN St. Pölten', 'St. Pölten', 'AT', 'Bundesliga', 'nv-arena-st-poelten', true),
  ('Cashpoint-Arena', 'SCR Altach', 'Altach', 'AT', 'Bundesliga', 'cashpoint-arena-altach', true),
  ('Lavanttal-Arena', 'Wolfsberger AC', 'Wolfsberg', 'AT', 'Bundesliga', 'lavanttal-arena-wolfsberg', true),

  -- CH Super League (6)
  ('St. Jakob-Park', 'FC Basel', 'Basel', 'CH', 'Super League', 'st-jakob-park-basel', true),
  ('Wankdorf', 'BSC Young Boys', 'Bern', 'CH', 'Super League', 'wankdorf-bern', true),
  ('Letzigrund', 'FC Zürich', 'Zürich', 'CH', 'Super League', 'letzigrund-zuerich', true),
  ('Stade de Genève', 'Servette FC', 'Genf', 'CH', 'Super League', 'stade-de-geneve', true),
  ('kybunpark', 'FC St. Gallen', 'St. Gallen', 'CH', 'Super League', 'kybunpark-st-gallen', true),
  ('Swissporarena', 'FC Luzern', 'Luzern', 'CH', 'Super League', 'swissporarena-luzern', true)

on conflict (slug) do nothing;
