import { useState, useRef, useEffect } from "react";

// ─── WATERWAY DATABASE (200+ US waterways) ───────────────────────────────────
const WATERWAYS = [
  // ── FLORIDA ──
  { name:"Jupiter Inlet, FL", aliases:["jupiter","jupiter fl","jupiter florida","jupiter inlet","loxahatchee","tequesta","juno beach","north palm beach"],
    region:"south_florida", type:"inlet", accidentRate:61, tidalRange:2.2, fogRisk:0.07, trafficLevel:8,
    hazards:["Fast tidal currents at the inlet","Heavy sportfishing traffic","Shallow sandbar at inlet mouth","Frequent vessel wakes from charter boats"] },
  { name:"Tampa Bay, FL", aliases:["tampa","tampa bay","st pete","saint pete","st. pete","clearwater","safety harbor","apollo beach","ruskin","terra ceia","palmetto fl"],
    region:"gulf_coast", type:"bay", accidentRate:72, tidalRange:2.1, fogRisk:0.12, trafficLevel:8,
    hazards:["Shallow shoals near Port Tampa","Heavy commercial ship traffic","Strong tidal currents at the narrows","Manatee zones — speed restrictions apply"] },
  { name:"Miami / Biscayne Bay, FL", aliases:["miami","biscayne","biscayne bay","miami beach","south beach","key biscayne","coconut grove","coral gables","aventura","hallandale","sunny isles"],
    region:"south_florida", type:"bay", accidentRate:89, tidalRange:2.8, fogRisk:0.08, trafficLevel:9,
    hazards:["Extremely high recreational boat traffic","Marked channel must be followed strictly","Sudden afternoon thunderstorms June–Sept","Shallow grass flats outside channels"] },
  { name:"Florida Keys, FL", aliases:["keys","key west","islamorada","marathon","key largo","big pine","duck key","summerland","cudjoe","sugarloaf","tavernier","plantation key"],
    region:"south_florida", type:"coastal", accidentRate:94, tidalRange:1.4, fogRisk:0.06, trafficLevel:9,
    hazards:["Extensive shallow reef system","Strong Gulf Stream currents offshore","Lobster season creates extreme congestion","Coral reef groundings common"] },
  { name:"Fort Lauderdale / Intracoastal, FL", aliases:["fort lauderdale","ft lauderdale","lauderdale","pompano","pompano beach","deerfield beach","boynton beach","delray beach","boca raton","boca","lighthouse point","hillsboro","lake worth","riviera beach"],
    region:"south_florida", type:"intracoastal", accidentRate:71, tidalRange:2.5, fogRisk:0.07, trafficLevel:9,
    hazards:["Extreme boat traffic on weekends","Bridge openings cause congestion","No-wake zones frequently ignored","Manatee protection zones"] },
  { name:"St. Johns River, FL", aliases:["st johns","st. johns","saint johns","jacksonville","palatka","sanford","astor","orange park","green cove springs","orange park fl","lake george fl"],
    region:"north_florida", type:"river", accidentRate:48, tidalRange:1.2, fogRisk:0.22, trafficLevel:6,
    hazards:["Morning fog common Oct–Mar","Submerged debris after storms","River current reversal with tides","Low bridge clearances upstream"] },
  { name:"Pensacola Bay, FL", aliases:["pensacola","pensacola bay","destin","fort walton","fort walton beach","niceville","navarre","gulf breeze","santa rosa sound","perdido key"],
    region:"gulf_coast", type:"bay", accidentRate:55, tidalRange:1.8, fogRisk:0.15, trafficLevel:7,
    hazards:["Shoaling near east pass","Military restricted zones","Strong winds from Gulf storms"] },
  { name:"Lake Okeechobee, FL", aliases:["okeechobee","lake okeechobee","belle glade","clewiston","pahokee","moore haven","okeechobee city"],
    region:"south_florida", type:"lake", accidentRate:38, tidalRange:0, fogRisk:0.18, trafficLevel:4,
    hazards:["Sudden shallow areas","Afternoon thunderstorms common","Wind chop builds quickly on open water","Limited emergency response coverage"] },
  { name:"Sarasota Bay, FL", aliases:["sarasota","sarasota bay","siesta key","longboat key","anna maria island","bradenton","venice fl","englewood fl","nokomis","osprey fl"],
    region:"gulf_coast", type:"bay", accidentRate:49, tidalRange:2.0, fogRisk:0.10, trafficLevel:7,
    hazards:["Shallow passes between barrier islands","Marked channel required near downtown","Frequent boat traffic near beaches","Red tide events seasonally"] },
  { name:"Charlotte Harbor, FL", aliases:["charlotte harbor","port charlotte","punta gorda","boca grande","gasparilla island","placida","pine island","cape haze","rotonda"],
    region:"gulf_coast", type:"harbor", accidentRate:44, tidalRange:2.3, fogRisk:0.11, trafficLevel:6,
    hazards:["Shallow grass flats outside channels","Strong currents at Boca Grande Pass","Tarpon season congestion May–July","Manatee speed zones throughout"] },
  { name:"Indian River Lagoon, FL", aliases:["indian river","indian river lagoon","vero beach","sebastian","titusville","cocoa beach","melbourne fl","palm bay","grant","malabar","fellsmere"],
    region:"south_florida", type:"lagoon", accidentRate:52, tidalRange:1.0, fogRisk:0.09, trafficLevel:7,
    hazards:["Extremely shallow — 3ft avg depth","Manatee protection zones strictly enforced","Shoaling near inlets","Seagrass beds damage propellers"] },
  { name:"Mosquito Lagoon, FL", aliases:["mosquito lagoon","new smyrna beach","edgewater fl","oak hill","canaveral national seashore","kennedy space center"],
    region:"north_florida", type:"lagoon", accidentRate:31, tidalRange:0.8, fogRisk:0.12, trafficLevel:5,
    hazards:["Very shallow — polling only in many areas","Manatee sanctuary zones","No motor zones in seagrass areas","National seashore restrictions"] },
  { name:"Caloosahatchee River, FL", aliases:["caloosahatchee","fort myers","cape coral","north fort myers","la belle","alva","matlacha","pine island fl","sanibel","captiva"],
    region:"gulf_coast", type:"river", accidentRate:46, tidalRange:1.8, fogRisk:0.13, trafficLevel:7,
    hazards:["Lock operations at Franklin Lock","Variable current from lake releases","Heavy boat traffic near Fort Myers","Manatee zones throughout"] },
  { name:"Apalachicola Bay, FL", aliases:["apalachicola","apalachicola bay","carrabelle","eastpoint","st george island","dog island","cape san blas","port st joe"],
    region:"gulf_coast", type:"bay", accidentRate:36, tidalRange:2.1, fogRisk:0.17, trafficLevel:4,
    hazards:["Oyster reef hazards throughout bay","Shallow water outside channels","Limited navigation markers","Remote — slow emergency response"] },
  { name:"Choctawhatchee Bay, FL", aliases:["choctawhatchee","choctawhatchee bay","niceville fl","valparaiso","freeport fl","miramar beach","sandestin","30a","south walton"],
    region:"gulf_coast", type:"bay", accidentRate:38, tidalRange:1.5, fogRisk:0.16, trafficLevel:5,
    hazards:["Shifting sandbars","Military airspace overhead","Limited markers in eastern bay","Storm surge risk"] },
  { name:"Lake Tohopekaliga, FL", aliases:["lake toho","tohopekaliga","kissimmee","st cloud","east lake toho","lake tohopekaliga"],
    region:"north_florida", type:"lake", accidentRate:28, tidalRange:0, fogRisk:0.15, trafficLevel:5,
    hazards:["Submerged vegetation","Water control structure fluctuates levels","Afternoon thunderstorms common","Alligator presence near shores"] },
  { name:"Perdido Bay, FL/AL", aliases:["perdido","perdido bay","perdido key fl","ono island","wolf bay","lillian al"],
    region:"gulf_coast", type:"bay", accidentRate:41, tidalRange:1.6, fogRisk:0.14, trafficLevel:5,
    hazards:["Shallow shoaling areas","Wake damage in no-wake zones","Storm surge risk during hurricanes"] },

  // ── GEORGIA ──
  { name:"Savannah River, GA", aliases:["savannah","savannah river","savannah ga","port of savannah","tybee island","thunderbolt ga","isle of hope"],
    region:"southeast", type:"river", accidentRate:58, tidalRange:7.2, fogRisk:0.24, trafficLevel:7,
    hazards:["Extreme tidal range at port","Heavy container ship traffic","Strong river current","Shoaling outside main channel"] },
  { name:"St. Simons Sound, GA", aliases:["st simons","saint simons","brunswick ga","jekyll island","golden isles","sea island","darien ga","st simons island"],
    region:"southeast", type:"sound", accidentRate:44, tidalRange:6.8, fogRisk:0.2, trafficLevel:5,
    hazards:["Tidal currents up to 4 knots","Shoaling at bar entrance","Commercial port traffic at Brunswick","Hurricane season risk"] },
  { name:"Lake Lanier, GA", aliases:["lake lanier","gainesville ga","cumming ga","buford ga","hall county","lanier islands","flowery branch","oakwood ga"],
    region:"southeast", type:"lake", accidentRate:55, tidalRange:0, fogRisk:0.12, trafficLevel:8,
    hazards:["Most dangerous lake in Georgia — highest accident rate","Extreme weekend congestion","Submerged structures from original flooding","No-wake zones frequently violated"] },
  { name:"Lake Allatoona, GA", aliases:["lake allatoona","allatoona","cartersville","canton ga","acworth","allatoona lake","emerson ga"],
    region:"southeast", type:"lake", accidentRate:38, tidalRange:0, fogRisk:0.11, trafficLevel:6,
    hazards:["Submerged tree stumps","Water level fluctuations from dam","Afternoon thunderstorms","Crowded coves on holidays"] },

  // ── SOUTH CAROLINA ──
  { name:"Charleston Harbor, SC", aliases:["charleston","charleston sc","isle of palms","mount pleasant","james island","daniel island","folly beach","sullivans island","johns island"],
    region:"southeast", type:"harbor", accidentRate:59, tidalRange:5.6, fogRisk:0.19, trafficLevel:7,
    hazards:["Strong tidal currents at inlet","Commercial port traffic","Shoaling at bar entrance","Hurricane risk June–November"] },
  { name:"Hilton Head / Port Royal Sound, SC", aliases:["hilton head","port royal sound","beaufort sc","hilton head island","daufuskie","bluffton sc","harbour town","broad creek"],
    region:"southeast", type:"sound", accidentRate:41, tidalRange:7.0, fogRisk:0.18, trafficLevel:6,
    hazards:["Strong tidal currents — up to 5 kts","Military installation near Parris Island","Shoaling at sound entrance","Extensive oyster reefs"] },
  { name:"Lake Murray, SC", aliases:["lake murray","columbia sc","irmo","chapin","lexington sc","saluda sc","ballentine"],
    region:"southeast", type:"lake", accidentRate:31, tidalRange:0, fogRisk:0.13, trafficLevel:6,
    hazards:["Submerged timber from original flooding","Water level drawdowns in fall","Holiday weekend congestion","Afternoon thunderstorms"] },
  { name:"Murrells Inlet / Grand Strand, SC", aliases:["murrells inlet","myrtle beach","pawleys island","garden city","surfside beach","little river sc","north myrtle beach","conway sc"],
    region:"southeast", type:"coastal", accidentRate:53, tidalRange:5.2, fogRisk:0.17, trafficLevel:7,
    hazards:["Shifting inlet bars","Heavy seasonal boat traffic","Shoaling near inlets","Hurricane season risk"] },

  // ── NORTH CAROLINA ──
  { name:"Outer Banks, NC", aliases:["outer banks","obx","nags head","kill devil hills","kitty hawk","manteo","hatteras","ocracoke","buxton","avon","rodanthe","waves","salvo","cape hatteras"],
    region:"southeast", type:"coastal", accidentRate:74, tidalRange:3.8, fogRisk:0.22, trafficLevel:7,
    hazards:["Diamond Shoals — notoriously shallow","Strong Gulf Stream influence","Rapid weather changes","Limited shelter in storms"] },
  { name:"Lake Norman, NC", aliases:["lake norman","cornelius","mooresville","huntersville","davidson nc","denver nc","sherrills ford","catawba nc"],
    region:"southeast", type:"lake", accidentRate:33, tidalRange:0, fogRisk:0.14, trafficLevel:6,
    hazards:["Submerged stumps in coves","Weekend congestion near marinas","Afternoon thunderstorms July–Aug","No-wake zones strictly enforced"] },
  { name:"Pamlico Sound, NC", aliases:["pamlico sound","pamlico","washington nc","bath nc","belhaven","engelhard","stumpy point","aurora nc"],
    region:"southeast", type:"sound", accidentRate:48, tidalRange:1.4, fogRisk:0.26, trafficLevel:4,
    hazards:["Extremely shallow — avg 4ft","No shelter from north winds","Long fetch creates dangerous chop","Limited navigation markers"] },
  { name:"Albemarle Sound, NC", aliases:["albemarle sound","albemarle","elizabeth city","edenton","hertford","columbia nc","powells point"],
    region:"southeast", type:"sound", accidentRate:41, tidalRange:0.8, fogRisk:0.28, trafficLevel:4,
    hazards:["Shallow shoaling at river mouths","Wind-driven waves build quickly","Fog common in fall/winter","Remote with limited rescue coverage"] },
  { name:"Jordan Lake, NC", aliases:["jordan lake","b everett jordan","apex nc","cary","pittsboro","new hope","chapel hill area"],
    region:"southeast", type:"lake", accidentRate:28, tidalRange:0, fogRisk:0.13, trafficLevel:5,
    hazards:["Submerged trees and stumps","Variable water levels","Afternoon thunderstorms","Designated swimming areas create congestion"] },

  // ── VIRGINIA ──
  { name:"Chesapeake Bay, MD/VA", aliases:["chesapeake","chesapeake bay","annapolis","baltimore","norfolk","virginia beach","hampton roads","cambridge md","oxford md","st michaels","rock hall","chestertown","easton md","kent island"],
    region:"mid_atlantic", type:"bay", accidentRate:81, tidalRange:3.2, fogRisk:0.28, trafficLevel:8,
    hazards:["Notorious for sudden squalls","Crab pot buoys throughout bay","Shoaling on eastern shore flats","Heavy commercial traffic in main channel"] },
  { name:"James River, VA", aliases:["james river","richmond va","hopewell","newport news","williamsburg va","charles city","glen allen","midlothian va"],
    region:"mid_atlantic", type:"river", accidentRate:44, tidalRange:2.8, fogRisk:0.22, trafficLevel:5,
    hazards:["Strong tidal currents near mouth","Rocks and shoals above Richmond","Industrial traffic near Hopewell","Debris after heavy rain"] },
  { name:"Smith Mountain Lake, VA", aliases:["smith mountain lake","sml","moneta va","hardy va","ferrum va","henry county va","westlake corner"],
    region:"mid_atlantic", type:"lake", accidentRate:28, tidalRange:0, fogRisk:0.15, trafficLevel:5,
    hazards:["Submerged timber","Cove congestion on holidays","Afternoon thunderstorms","Water level fluctuations"] },
  { name:"Lake Gaston, VA/NC", aliases:["lake gaston","roanoke rapids","littleton nc","henrico nc","bracey va","gaston nc"],
    region:"southeast", type:"lake", accidentRate:27, tidalRange:0, fogRisk:0.14, trafficLevel:4,
    hazards:["Submerged tree stumps","Variable water levels","Afternoon thunderstorms","Remote coves with limited cell service"] },

  // ── MARYLAND ──
  { name:"Potomac River, MD/VA/DC", aliases:["potomac","potomac river","washington dc","national harbor","alexandria va","occoquan","quantico","fredericksburg","dc waterfront","wharf dc","accokeek"],
    region:"mid_atlantic", type:"river", accidentRate:62, tidalRange:2.9, fogRisk:0.25, trafficLevel:7,
    hazards:["Restricted airspace and security zones near DC","Strong tidal currents lower river","Rocks and rapids upper sections","High recreational traffic near DC"] },
  { name:"Patuxent River, MD", aliases:["patuxent river","solomons md","calvert county","prince frederick","benedict md","broomes island"],
    region:"mid_atlantic", type:"river", accidentRate:38, tidalRange:2.2, fogRisk:0.23, trafficLevel:5,
    hazards:["Naval air station restricted areas","Shoaling at river mouth","Crab pot buoys throughout","Tidal current at entrance"] },
  { name:"Sassafras River, MD", aliases:["sassafras river","georgetown md","galena md","betterton","kentmorr","chestertown area"],
    region:"mid_atlantic", type:"river", accidentRate:28, tidalRange:1.8, fogRisk:0.22, trafficLevel:4,
    hazards:["Narrow channel with shoaling edges","Summer congestion near Georgetown","Crab pots throughout","No-wake zones near marinas"] },

  // ── DELAWARE & NEW JERSEY ──
  { name:"Delaware Bay, DE/NJ", aliases:["delaware bay","delaware","wilmington","cape may","lewes","rehoboth beach","bethany beach","dewey beach","dover de","milford de"],
    region:"mid_atlantic", type:"bay", accidentRate:58, tidalRange:5.4, fogRisk:0.31, trafficLevel:6,
    hazards:["Strong tidal currents up to 4 knots","Dense fog common spring months","Commercial vessel traffic","Oyster beds — stay in channels"] },
  { name:"Barnegat Bay, NJ", aliases:["barnegat bay","barnegat","toms river","seaside heights","lavallette","surf city","ship bottom","beach haven","long beach island","lbi","manahawkin","little egg harbor"],
    region:"mid_atlantic", type:"bay", accidentRate:57, tidalRange:3.2, fogRisk:0.26, trafficLevel:7,
    hazards:["Very shallow — avg 4ft depth","Strong tidal currents at inlets","Extreme summer congestion","Shoaling at inlets after storms"] },
  { name:"Sandy Hook Bay, NJ", aliases:["sandy hook bay","sandy hook","keansburg","highlands nj","atlantic highlands","red bank nj","shrewsbury river"],
    region:"northeast", type:"bay", accidentRate:49, tidalRange:4.8, fogRisk:0.28, trafficLevel:6,
    hazards:["Strong tidal currents","Ferry traffic","Military restricted area near fort","Fog common in spring"] },
  { name:"Raritan Bay, NJ", aliases:["raritan bay","raritan","perth amboy","south amboy","keyport","keansburg","south river nj"],
    region:"northeast", type:"bay", accidentRate:52, tidalRange:5.0, fogRisk:0.29, trafficLevel:6,
    hazards:["Heavy tanker traffic","Strong tidal currents","Fog common spring months","Shoaling near river mouths"] },

  // ── NEW YORK ──
  { name:"New York Harbor, NY", aliases:["new york harbor","new york","nyc","hudson river","manhattan","brooklyn","jersey city","staten island","hoboken","weehawken","bayonne","governors island"],
    region:"northeast", type:"harbor", accidentRate:82, tidalRange:5.1, fogRisk:0.30, trafficLevel:9,
    hazards:["Extreme commercial vessel traffic","Strong tidal currents at narrows","Ferry and water taxi crossings","Limited visibility in harbor fog"] },
  { name:"Long Island Sound, NY/CT", aliases:["long island sound","long island","larchmont","greenwich","stamford","new haven","bridgeport","oyster bay","port washington","huntington","northport","setauket","mystic ct","new london","old saybrook","guilford ct"],
    region:"northeast", type:"sound", accidentRate:76, tidalRange:6.8, fogRisk:0.34, trafficLevel:8,
    hazards:["Strong tidal rips at Race Point","Ferry traffic crossing lanes","Dense fog in spring and fall","Rocks and ledges near CT shore"] },
  { name:"Great South Bay, NY", aliases:["great south bay","fire island","islip","bay shore","babylon","lindenhurst","patchogue","sayville","ocean beach","mastic","shirley"],
    region:"northeast", type:"bay", accidentRate:58, tidalRange:3.5, fogRisk:0.25, trafficLevel:7,
    hazards:["Shallow throughout — 4ft average","Strong currents at Fire Island Inlet","High summer recreational traffic","Fog common spring and fall"] },
  { name:"Lake Champlain, NY/VT", aliases:["lake champlain","burlington vt","plattsburgh ny","port henry","ticonderoga","vergennes vt","charlotte vt","grand isle vt","crown point"],
    region:"northeast", type:"lake", accidentRate:32, tidalRange:0, fogRisk:0.22, trafficLevel:4,
    hazards:["Cold water year-round","Sudden weather changes","Rocks near shoreline","Limited shelter on open water"] },
  { name:"Finger Lakes, NY", aliases:["finger lakes","seneca lake","cayuga lake","keuka lake","canandaigua lake","skaneateles lake","ithaca","watkins glen","penn yan","geneva ny","hammondsport","cortland"],
    region:"northeast", type:"lake", accidentRate:24, tidalRange:0, fogRisk:0.20, trafficLevel:4,
    hazards:["Deep cold lakes — hypothermia risk","Sudden afternoon thunderstorms","Steep shorelines limit shelter","Rocks near shores in several lakes"] },
  { name:"Lake George, NY", aliases:["lake george","lake george ny","bolton landing","ticonderoga area","warrensburg","queensbury ny"],
    region:"northeast", type:"lake", accidentRate:29, tidalRange:0, fogRisk:0.18, trafficLevel:6,
    hazards:["Rocks and shoals near north end","Summer congestion near village","Afternoon thunderstorms","Cold water spring and fall"] },

  // ── CONNECTICUT & RHODE ISLAND ──
  { name:"Narragansett Bay, RI", aliases:["narragansett bay","narragansett","rhode island","providence","newport ri","bristol ri","warren ri","tiverton","portsmouth ri","jamestown ri","conanicut"],
    region:"northeast", type:"bay", accidentRate:54, tidalRange:4.8, fogRisk:0.33, trafficLevel:7,
    hazards:["Tidal currents strong at bridges","Heavy sailboat racing traffic summers","Fog common May–July","Naval station restricted zones"] },
  { name:"Thames River, CT", aliases:["thames river ct","new london ct","groton ct","norwich ct","gales ferry"],
    region:"northeast", type:"river", accidentRate:41, tidalRange:3.0, fogRisk:0.29, trafficLevel:6,
    hazards:["Submarine base traffic near Groton","Strong tidal currents","Commercial and naval vessel priority","Fog common in spring"] },

  // ── MASSACHUSETTS ──
  { name:"Boston Harbor, MA", aliases:["boston","boston harbor","quincy ma","lynn ma","gloucester","salem ma","marblehead","scituate","hull ma","cohasset","hingham","weymouth"],
    region:"northeast", type:"harbor", accidentRate:48, tidalRange:9.4, fogRisk:0.38, trafficLevel:7,
    hazards:["Extreme tidal range — stranding risk","Ferry traffic from multiple terminals","Dense fog spring months","Rocky ledges throughout harbor"] },
  { name:"Buzzards Bay, MA", aliases:["buzzards bay","cape cod","falmouth","woods hole","marion ma","mattapoisett","new bedford","fairhaven","wareham","onset","bourne"],
    region:"northeast", type:"bay", accidentRate:52, tidalRange:4.0, fogRisk:0.36, trafficLevel:7,
    hazards:["Cape Cod Canal strong currents","Notorious for afternoon sea breeze","Dense fog June–August","Rocky ledges near Vineyard Sound"] },
  { name:"Vineyard & Nantucket Sound, MA", aliases:["vineyard sound","nantucket sound","marthas vineyard","martha vineyard","nantucket","edgartown","oak bluffs","hyannis","chatham","wellfleet","provincetown","vineyard haven","menemsha"],
    region:"northeast", type:"sound", accidentRate:56, tidalRange:2.8, fogRisk:0.40, trafficLevel:7,
    hazards:["Strong tidal currents in Vineyard Sound","Dense fog extremely common","Ferry traffic year-round","Shoaling near Nantucket"] },
  { name:"Penobscot Bay, ME", aliases:["penobscot bay","penobscot","rockland me","camden me","belfast me","castine","deer isle","stonington me","north haven","vinalhaven","islesboro"],
    region:"northeast", type:"bay", accidentRate:39, tidalRange:10.2, fogRisk:0.44, trafficLevel:4,
    hazards:["Extreme tidal range","Fog very common June–August","Lobster trap buoys everywhere","Cold water — hypothermia risk high"] },
  { name:"Casco Bay, ME", aliases:["casco bay","portland maine","south portland","cape elizabeth","chebeague island","long island me","peaks island","harpswell","brunswick me","freeport me"],
    region:"northeast", type:"bay", accidentRate:36, tidalRange:9.8, fogRisk:0.42, trafficLevel:5,
    hazards:["Extreme tidal range","Rocks and ledges throughout","Dense fog common spring–summer","Ferry and cargo traffic in main channel"] },
  { name:"Mount Desert / Acadia, ME", aliases:["acadia","bar harbor","mount desert island","bass harbor","southwest harbor","ellsworth me","blue hill me","trenton me","seal harbor","northeast harbor"],
    region:"northeast", type:"coastal", accidentRate:28, tidalRange:11.0, fogRisk:0.46, trafficLevel:4,
    hazards:["Extreme tidal range — up to 14ft","Cold water year-round","Dense fog very common","Rocks and islands throughout"] },
  { name:"Lake Winnipesaukee, NH", aliases:["lake winnipesaukee","winnipesaukee","laconia","meredith nh","weirs beach","wolfeboro","center harbor","moultonborough","alton bay"],
    region:"northeast", type:"lake", accidentRate:34, tidalRange:0, fogRisk:0.17, trafficLevel:6,
    hazards:["Summer congestion near Weirs Beach","Rocks and ledges throughout","Sudden afternoon thunderstorms","Cold water in spring and fall"] },

  // ── GREAT LAKES ──
  { name:"Lake Michigan", aliases:["lake michigan","chicago","milwaukee","green bay wi","traverse city","michigan city","waukegan","kenosha","sheboygan","manitowoc","two rivers","sturgeon bay","holland mi","grand haven","muskegon","ludington","petoskey","charlevoix","frankfort mi"],
    region:"great_lakes", type:"lake", accidentRate:61, tidalRange:0, fogRisk:0.25, trafficLevel:6,
    hazards:["No tides but seiche waves possible","Sudden storms with large swells","Cold water year-round — hypothermia risk","Rip currents near shore"] },
  { name:"Lake Erie", aliases:["lake erie","cleveland","erie pa","toledo","buffalo","sandusky","presque isle","ashtabula","conneaut","fairport harbor","lorain","huron oh","port clinton","catawba island","marblehead oh"],
    region:"great_lakes", type:"lake", accidentRate:67, tidalRange:0, fogRisk:0.29, trafficLevel:6,
    hazards:["Shallowest Great Lake — choppiest waves","Rapid storm development","Commercial freighter traffic","Dangerous in westerly winds"] },
  { name:"Lake Superior", aliases:["lake superior","duluth","marquette","houghton","bayfield","apostle islands","two harbors","grand marais mn","grand marais mi","munising","pictured rocks","copper harbor","keweenaw","silver bay","taconite harbor"],
    region:"great_lakes", type:"lake", accidentRate:42, tidalRange:0, fogRisk:0.32, trafficLevel:3,
    hazards:["Coldest Great Lake — hypothermia in minutes","Extreme weather can develop in 1 hour","Rocky shoreline with few harbors","Iron ore shipping lanes"] },
  { name:"Lake Huron", aliases:["lake huron","alpena","port huron","midland mi","parry sound","drummond island","de tour village","rogers city","cheboygan","mackinac island","mackinac city","st ignace"],
    region:"great_lakes", type:"lake", accidentRate:44, tidalRange:0, fogRisk:0.27, trafficLevel:4,
    hazards:["Shoals and rocky reefs throughout","Sudden weather changes","Remote areas with limited rescue response","Large open-water crossings"] },
  { name:"Lake Ontario", aliases:["lake ontario","rochester ny","oswego","sodus bay","olcott","wilson ny","youngstown ny","henderson harbor","sackets harbor","cape vincent"],
    region:"great_lakes", type:"lake", accidentRate:48, tidalRange:0, fogRisk:0.28, trafficLevel:4,
    hazards:["Smallest Great Lake but deep and dangerous","Sudden storms with steep waves","Cold water year-round","Shoals near US shore"] },
  { name:"Green Bay, WI", aliases:["green bay wi","sturgeon bay","door county","fish creek","sister bay","egg harbor wi","ephraim wi","baileys harbor","algoma wi","kewaunee"],
    region:"great_lakes", type:"bay", accidentRate:36, tidalRange:0, fogRisk:0.24, trafficLevel:4,
    hazards:["Rocky reefs throughout Door County","Sudden squalls from northwest","Cold water spring and fall","Shoaling near river mouths"] },
  { name:"Saginaw Bay, MI", aliases:["saginaw bay","bay city mi","saginaw","pinconning","standish","au gres","caseville","port austin","bad axe area","sebewaing"],
    region:"great_lakes", type:"bay", accidentRate:42, tidalRange:0, fogRisk:0.26, trafficLevel:4,
    hazards:["Shallow throughout — 15ft average","Rapid storm development","Shoaling at river mouths","Fog common spring and fall"] },
  { name:"Lake St. Clair, MI", aliases:["lake st clair","lake saint clair","st clair shores","grosse pointe","harrison township mi","new baltimore","anchor bay","st clair mi","marine city"],
    region:"great_lakes", type:"lake", accidentRate:58, tidalRange:0, fogRisk:0.20, trafficLevel:8,
    hazards:["Extremely high recreational traffic","Shallow — avg 11ft depth","Strong currents in St. Clair River","Commercial freighter traffic in channels"] },
  { name:"Northern Michigan Inland Lakes", aliases:["torch lake","crystal lake mi","burt lake","mullett lake","higgins lake","houghton lake","elk lake mi","boyne city","gaylord mi","indian river mi","walloon lake"],
    region:"great_lakes", type:"lake", accidentRate:26, tidalRange:0, fogRisk:0.18, trafficLevel:5,
    hazards:["Cold water spring and fall","Afternoon thunderstorms","Weekend congestion in summer","Rocks near shoreline on some lakes"] },

  // ── OHIO / INDIANA ──
  { name:"Ohio River", aliases:["ohio river","cincinnati","louisville","huntington wv","portsmouth oh","gallipolis","marietta oh","wheeling wv","point pleasant wv","madison indiana","evansville"],
    region:"midwest", type:"river", accidentRate:52, tidalRange:0, fogRisk:0.28, trafficLevel:6,
    hazards:["Commercial tow traffic — give way","River levels fluctuate significantly","Lock and dam operations","Fog common in fall and winter"] },
  { name:"Lake Erie Islands, OH", aliases:["put in bay","south bass island","kelleys island","middle bass island","north bass island","port clinton oh","marblehead oh","sandusky bay"],
    region:"great_lakes", type:"coastal", accidentRate:52, tidalRange:0, fogRisk:0.26, trafficLevel:7,
    hazards:["Rocky reefs throughout islands","High ferry and tour boat traffic","Sudden storms","Shoaling in Sandusky Bay"] },

  // ── MIDWEST ──
  { name:"Mississippi River, Upper", aliases:["mississippi river upper","upper mississippi","minneapolis","st paul","la crosse","dubuque","quad cities","davenport","rock island","moline","galena","prairie du chien","lake pepin","hastings mn"],
    region:"midwest", type:"river", accidentRate:57, tidalRange:0, fogRisk:0.30, trafficLevel:6,
    hazards:["Commercial barge traffic","Lock and dam operations throughout","Snags and submerged debris","Strong current during spring runoff"] },
  { name:"Mississippi River, Lower", aliases:["mississippi river lower","lower mississippi","memphis","natchez","vicksburg","greenville ms","baton rouge","new orleans","cairo il","helena ar"],
    region:"gulf_coast", type:"river", accidentRate:68, tidalRange:1.2, fogRisk:0.28, trafficLevel:7,
    hazards:["Heavy commercial barge traffic","Strong current year-round","Fog common in winter","Wing dams and revetments not always marked"] },
  { name:"Lake of the Ozarks, MO", aliases:["lake of the ozarks","lake ozarks","osage beach","camdenton","lake ozark","bagnell dam","ha ha tonka","sunrise beach","climax springs"],
    region:"midwest", type:"lake", accidentRate:62, tidalRange:0, fogRisk:0.14, trafficLevel:9,
    hazards:["One of nation's highest boating accident rates","Extreme holiday congestion","Narrow coves with fast boat traffic","Submerged tree stumps throughout"] },
  { name:"Table Rock Lake, MO/AR", aliases:["table rock lake","table rock","branson","hollister mo","kimberling city","blue eye mo","shell knob","eagle rock mo"],
    region:"midwest", type:"lake", accidentRate:38, tidalRange:0, fogRisk:0.13, trafficLevel:6,
    hazards:["Submerged timber","Deep clear water — deceiving distances","Afternoon thunderstorms","Holiday weekend congestion near Branson"] },
  { name:"Lake Texoma, TX/OK", aliases:["lake texoma","denison tx","pottsboro","durant ok","madill","texoma","gordonville tx","thackerville"],
    region:"midwest", type:"lake", accidentRate:38, tidalRange:0, fogRisk:0.14, trafficLevel:6,
    hazards:["Large open water — weather builds quickly","Submerged timber","Striped bass tournament congestion","Strong winds from north"] },
  { name:"Minnesota Lake Country", aliases:["lake of the woods","lake minnetonka","minnetonka","leech lake","red lake","mille lacs","brainerd lakes","cass lake","bemidji","gull lake mn","minneapolis lakes","prior lake","white bear lake"],
    region:"midwest", type:"lake", accidentRate:31, tidalRange:0, fogRisk:0.22, trafficLevel:5,
    hazards:["Cold water spring and fall","Afternoon thunderstorms","Rocky reefs in many lakes","Ice-out conditions unstable in early spring"] },
  { name:"Lake Winnebago, WI", aliases:["lake winnebago","winnebago","oshkosh","fond du lac","neenah","menasha","omro","rush lake wi","waupun"],
    region:"great_lakes", type:"lake", accidentRate:35, tidalRange:0, fogRisk:0.23, trafficLevel:5,
    hazards:["Shallow with sudden chop in wind","Shipping channel through lake","Fog common spring and fall","Limited shelter on open water"] },
  { name:"Wisconsin River", aliases:["wisconsin river","wisconsin dells","portage wi","wausau","mosinee","boscobel","prairie du chien wi","sauk city"],
    region:"midwest", type:"river", accidentRate:32, tidalRange:0, fogRisk:0.20, trafficLevel:4,
    hazards:["Sandbars and shallows throughout","Dells area congestion in summer","Debris after spring floods","Low clearance bridges"] },

  // ── TEXAS ──
  { name:"Galveston Bay, TX", aliases:["galveston","galveston bay","houston","clear lake tx","seabrook","kemah","texas city","freeport","la marque","dickinson tx","bacliff","san leon"],
    region:"gulf_coast", type:"bay", accidentRate:77, tidalRange:1.6, fogRisk:0.18, trafficLevel:8,
    hazards:["Heavy industrial shipping traffic","Shallow outside marked channels","Frequent thunderstorms spring/summer","Oil platform hazards offshore"] },
  { name:"Corpus Christi Bay, TX", aliases:["corpus christi","corpus christi bay","port aransas","rockport tx","aransas pass","ingleside","portland tx","north padre island","mustang island","flour bluff"],
    region:"gulf_coast", type:"bay", accidentRate:63, tidalRange:1.4, fogRisk:0.15, trafficLevel:7,
    hazards:["Shallow Laguna Madre nearby","Heavy fishing traffic","Sudden afternoon thunderstorms","Hurricane season risk"] },
  { name:"Sabine Lake, TX/LA", aliases:["sabine lake","port arthur","orange tx","sabine pass","beaumont","nederland tx","groves","port neches","bridge city"],
    region:"gulf_coast", type:"lake", accidentRate:56, tidalRange:1.3, fogRisk:0.22, trafficLevel:6,
    hazards:["Heavy industrial barge traffic","Dense fog common in winter","Shoaling in upper lake","Petrochemical facilities nearby"] },
  { name:"Lake Travis, TX", aliases:["lake travis","austin","lakeway","bee cave","hudson bend","volente","lago vista","west lake hills","marble falls tx"],
    region:"midwest", type:"lake", accidentRate:48, tidalRange:0, fogRisk:0.10, trafficLevel:7,
    hazards:["Rapid water level changes","Submerged structures at low water","Cliff jumping hazards near Hippie Hollow","High summer traffic near Austin"] },
  { name:"Lake LBJ, TX", aliases:["lake lbj","marble falls","horseshoe bay","cottonwood shores","kingsland tx","llano river"],
    region:"midwest", type:"lake", accidentRate:42, tidalRange:0, fogRisk:0.09, trafficLevel:7,
    hazards:["Constant-level lake — high traffic","Fast recreational boat traffic","Rock outcroppings near shore","Afternoon thunderstorms"] },
  { name:"Lake Buchanan, TX", aliases:["lake buchanan","buchanan dam","llano tx","tow tx","burnet county","vanishing texas","inks lake"],
    region:"midwest", type:"lake", accidentRate:27, tidalRange:0, fogRisk:0.10, trafficLevel:4,
    hazards:["Rocky shoreline","Variable water levels","Afternoon thunderstorms","Remote sections with limited access"] },
  { name:"Lake Fork, TX", aliases:["lake fork","quitman tx","emory tx","lake fork tx","wood county","alba tx","winnsboro"],
    region:"midwest", type:"lake", accidentRate:30, tidalRange:0, fogRisk:0.14, trafficLevel:5,
    hazards:["Submerged timber everywhere","Variable water levels","Bass tournament boat traffic","Afternoon thunderstorms"] },
  { name:"Sam Rayburn Reservoir, TX", aliases:["sam rayburn","sam rayburn reservoir","jasper tx","hemphill tx","pineland","zavalla","brookeland"],
    region:"gulf_coast", type:"lake", accidentRate:34, tidalRange:0, fogRisk:0.16, trafficLevel:5,
    hazards:["Submerged timber at low water","Remote sections","Afternoon thunderstorms","Variable water levels from dam"] },
  { name:"Toledo Bend Reservoir, TX/LA", aliases:["toledo bend","toledo bend reservoir","many la","hemphill","logansport la","shelbyville tx","zwolle"],
    region:"gulf_coast", type:"lake", accidentRate:32, tidalRange:0, fogRisk:0.17, trafficLevel:5,
    hazards:["Submerged trees and stumps","Variable water levels","Remote with limited rescue response","Afternoon thunderstorms"] },

  // ── LOUISIANA ──
  { name:"Lake Pontchartrain, LA", aliases:["lake pontchartrain","new orleans","metairie","mandeville","covington la","slidell","madisonville la","lacombe","abita springs"],
    region:"gulf_coast", type:"lake", accidentRate:59, tidalRange:0.8, fogRisk:0.22, trafficLevel:6,
    hazards:["Extremely shallow avg 12–14ft","Sudden thunderstorms","Hurricane surge flooding","Limited shelter from wind"] },
  { name:"Atchafalaya Basin, LA", aliases:["atchafalaya","atchafalaya basin","morgan city","henderson la","breaux bridge","butte la rose","krotz springs","melville la"],
    region:"gulf_coast", type:"river", accidentRate:48, tidalRange:1.0, fogRisk:0.25, trafficLevel:5,
    hazards:["Maze of bayous — easy to get lost","Fallen trees and debris","Fog common in fall/winter","Alligator and cottonmouth areas"] },
  { name:"Calcasieu Lake, LA", aliases:["calcasieu lake","lake charles","westlake la","sulphur la","hackberry la","cameron la","grand lake la"],
    region:"gulf_coast", type:"lake", accidentRate:44, tidalRange:1.4, fogRisk:0.20, trafficLevel:5,
    hazards:["Industrial ship traffic","Shoaling outside channels","Hurricane risk","Fog common in winter"] },

  // ── MIDWEST LAKES ──
  { name:"Lake Sakakawea, ND", aliases:["lake sakakawea","pick city nd","garrison nd","williston nd","parshall","van hook","four bears nd","new town nd"],
    region:"midwest", type:"lake", accidentRate:26, tidalRange:0, fogRisk:0.18, trafficLevel:3,
    hazards:["Cold water most of year","Strong winds across large open water","Remote areas with limited cell service","Submerged trees in coves"] },
  { name:"Lake Oahe, SD/ND", aliases:["lake oahe","pierre sd","mobridge","gettysburg sd","pollock sd","mclaughlin","bismarck nd area"],
    region:"midwest", type:"lake", accidentRate:24, tidalRange:0, fogRisk:0.18, trafficLevel:3,
    hazards:["Very large open water — weather changes fast","Cold water most of year","Remote sections","Submerged structure hazards"] },
  { name:"Lewis & Clark Lake, SD/NE", aliases:["lewis and clark lake","lewis clark lake","yankton sd","gavins point","crofton ne","niobrara ne","running water sd"],
    region:"midwest", type:"lake", accidentRate:24, tidalRange:0, fogRisk:0.16, trafficLevel:3,
    hazards:["Moderate current from dam releases","Cold water spring and fall","Afternoon thunderstorms","Floating debris after storms"] },
  { name:"Lake Sharpe, SD", aliases:["lake sharpe","pierre sd lake","fort thompson","oacoma","chamberlain sd"],
    region:"midwest", type:"lake", accidentRate:21, tidalRange:0, fogRisk:0.17, trafficLevel:2,
    hazards:["Remote with very limited services","Cold water most of year","Strong winds","Limited navigation markers"] },

  // ── MOUNTAIN WEST ──
  { name:"Lake Mead, NV/AZ", aliases:["lake mead","boulder city","laughlin nv","las vegas area","henderson nv","overton nv","echo bay","temple bar","south cove"],
    region:"west_mountain", type:"lake", accidentRate:44, tidalRange:0, fogRisk:0.05, trafficLevel:7,
    hazards:["Extreme heat in summer — dehydration risk","Fast afternoon winds and whitecaps","Rapidly falling water levels","Submerged structures as levels drop"] },
  { name:"Lake Powell, UT/AZ", aliases:["lake powell","page az","wahweap","bullfrog ut","halls crossing","antelope canyon","glen canyon","big water ut"],
    region:"west_mountain", type:"lake", accidentRate:36, tidalRange:0, fogRisk:0.04, trafficLevel:5,
    hazards:["Extreme heat May–September","Afternoon winds create dangerous chop","Rapidly dropping water levels expose hazards","Remote canyons — limited rescue access"] },
  { name:"Lake Havasu, AZ/CA", aliases:["lake havasu","lake havasu city","parker az","topock","needles ca","crystal beach","lake havasu az","chemehuevi"],
    region:"west_mountain", type:"lake", accidentRate:52, tidalRange:0, fogRisk:0.04, trafficLevel:8,
    hazards:["Extreme heat in summer","High recreational traffic on weekends","Fast boat traffic near London Bridge","Underwater rocks in coves"] },
  { name:"Lake Tahoe, CA/NV", aliases:["lake tahoe","tahoe","south lake tahoe","tahoe city","incline village","truckee","crystal bay","zephyr cove","stateline nv","kings beach"],
    region:"west_mountain", type:"lake", accidentRate:29, tidalRange:0, fogRisk:0.1, trafficLevel:5,
    hazards:["Afternoon thunderstorms in summer","High altitude — UV exposure extreme","Cold water year-round","Wakeboarding congestion near shore"] },
  { name:"Flaming Gorge Reservoir, UT/WY", aliases:["flaming gorge","dutch john ut","manila utah","flaming gorge reservoir","green river wy area","lucerne valley"],
    region:"west_mountain", type:"lake", accidentRate:24, tidalRange:0, fogRisk:0.08, trafficLevel:3,
    hazards:["Cold deep water","Afternoon thunderstorms","Remote — limited rescue response","Afternoon canyon winds common"] },
  { name:"Colorado River, Parker to Laughlin", aliases:["colorado river parker","parker strip","parker az","needles ca strip","laughlin","bullhead city","fort mohave","topock az"],
    region:"west_mountain", type:"river", accidentRate:58, tidalRange:0, fogRisk:0.05, trafficLevel:8,
    hazards:["Extreme heat — dehydration risk","Fast current near dams","High recreational traffic on weekends","Alcohol-related accidents very common"] },
  { name:"Shasta Lake, CA", aliases:["shasta lake","redding ca","shasta","lakeshore ca","bridge bay","jones valley","o brien ca","lakehead"],
    region:"west_mountain", type:"lake", accidentRate:34, tidalRange:0, fogRisk:0.10, trafficLevel:5,
    hazards:["Rapidly varying water levels","Submerged structures at low water","Afternoon winds and chop","Houseboat traffic in main arms"] },
  { name:"Folsom Lake, CA", aliases:["folsom lake","folsom ca","granite bay","el dorado hills","lincoln ca","penryn","loomis ca"],
    region:"west_mountain", type:"lake", accidentRate:31, tidalRange:0, fogRisk:0.10, trafficLevel:6,
    hazards:["Rapidly changing water levels","Submerged trees and fences at low water","Afternoon winds","Speed boating zones conflict with paddlers"] },
  { name:"Clear Lake, CA", aliases:["clear lake ca","lakeport","clearlake ca","clearlake oaks","kelseyville","nice ca","lucerne ca","upper lake ca"],
    region:"west_coast", type:"lake", accidentRate:38, tidalRange:0, fogRisk:0.15, trafficLevel:5,
    hazards:["Algal blooms common in summer","Very shallow — 28ft average","Strong afternoon winds","Submerged rocks near tule beds"] },
  { name:"Flathead Lake, MT", aliases:["flathead lake","kalispell","polson","bigfork mt","lakeside mt","somers mt","ronan mt","dayton mt"],
    region:"west_mountain", type:"lake", accidentRate:27, tidalRange:0, fogRisk:0.14, trafficLevel:4,
    hazards:["Cold water year-round — hypothermia risk","Sudden afternoon thunderstorms","Rocks near shoreline","Large open water — conditions change fast"] },
  { name:"Coeur d'Alene Lake, ID", aliases:["coeur d alene","coeur dalene","coeur d'alene","cda lake","harrison id","plummer id","worley","bayview id"],
    region:"west_mountain", type:"lake", accidentRate:32, tidalRange:0, fogRisk:0.18, trafficLevel:5,
    hazards:["Cold water spring and fall","Afternoon winds","Mine contamination history — check advisories","Summer congestion near resort"] },
  { name:"Pend Oreille Lake, ID", aliases:["lake pend oreille","pend oreille","sandpoint","hope id","clark fork id","bayview id","priest river"],
    region:"west_mountain", type:"lake", accidentRate:22, tidalRange:0, fogRisk:0.20, trafficLevel:3,
    hazards:["Cold deep water — one of deepest in US","Sudden weather changes","Naval testing facility area","Remote sections with no cell service"] },
  { name:"Bear Lake, UT/ID", aliases:["bear lake","garden city ut","laketown","st charles id","montpelier id","paris id"],
    region:"west_mountain", type:"lake", accidentRate:21, tidalRange:0, fogRisk:0.11, trafficLevel:4,
    hazards:["Turquoise color makes depth deceptive","Cold water year-round","Afternoon winds create chop","Rocky limestone shoals"] },
  { name:"Strawberry Reservoir, UT", aliases:["strawberry reservoir","heber city","daniels summit","strawberry ut","soldier creek"],
    region:"west_mountain", type:"lake", accidentRate:20, tidalRange:0, fogRisk:0.12, trafficLevel:3,
    hazards:["Cold water most of year","High altitude — rapid weather changes","Afternoon thunderstorms","Limited cell service"] },

  // ── PACIFIC COAST ──
  { name:"San Francisco Bay, CA", aliases:["san francisco","sf bay","san francisco bay","oakland","berkeley","richmond ca","sausalito","marin ca","alameda","south bay","foster city","redwood city","benicia","vallejo","concord ca","antioch ca"],
    region:"west_coast", type:"bay", accidentRate:63, tidalRange:5.8, fogRisk:0.52, trafficLevel:7,
    hazards:["Dense fog June–August (Karl the Fog)","Strong tidal currents at Golden Gate 4-6 kts","Large container ship traffic","Cold water — hypothermia risk year-round"] },
  { name:"Puget Sound, WA", aliases:["puget sound","seattle","tacoma","olympia","bremerton","bellingham","everett","anacortes","gig harbor","vashon island","port townsend","sequim","port angeles","whidbey island","coupeville","oak harbor","poulsbo","silverdale"],
    region:"pacific_northwest", type:"sound", accidentRate:57, tidalRange:11.2, fogRisk:0.41, trafficLevel:7,
    hazards:["Extreme tidal currents in narrows","Ferry traffic — strict right of way","Unpredictable weather year-round","Kelp beds foul propellers"] },
  { name:"San Diego Bay, CA", aliases:["san diego","san diego bay","coronado","chula vista","national city","mission bay","shelter island","point loma","imperial beach"],
    region:"west_coast", type:"bay", accidentRate:44, tidalRange:5.2, fogRisk:0.21, trafficLevel:7,
    hazards:["Naval vessel traffic — restricted zones","Submarine operations area","Morning fog May–June (June Gloom)","Strong Santa Ana winds in fall"] },
  { name:"Los Angeles / Marina del Rey, CA", aliases:["los angeles","la","marina del rey","santa monica","long beach","newport beach","huntington beach","redondo beach","seal beach","dana point","laguna beach","san pedro","avalon","two harbors catalina","cabrillo beach"],
    region:"west_coast", type:"coastal", accidentRate:58, tidalRange:5.7, fogRisk:0.32, trafficLevel:8,
    hazards:["Marine layer fog common June–Aug","High recreational vessel density","Kelp beds near shore","Santa Ana wind events fall/winter"] },
  { name:"Monterey Bay, CA", aliases:["monterey bay","monterey","santa cruz ca","capitola","moss landing","carmel","pacific grove","seaside ca","aptos"],
    region:"west_coast", type:"bay", accidentRate:38, tidalRange:5.5, fogRisk:0.44, trafficLevel:5,
    hazards:["Dense fog common year-round","Cold water year-round — hypothermia risk","Submarine canyon creates rough seas","Sea otter protected areas"] },
  { name:"Humboldt Bay, CA", aliases:["humboldt bay","eureka ca","arcata","fortuna","samoa ca","fields landing"],
    region:"west_coast", type:"bay", accidentRate:46, tidalRange:6.2, fogRisk:0.55, trafficLevel:4,
    hazards:["Dangerous bar crossing at entrance","Dense fog most of year","Strong tidal currents","Commercial fishing traffic"] },
  { name:"Columbia River, OR/WA", aliases:["columbia river","portland","astoria","columbia","camas wa","hood river","the dalles","longview wa","kelso","st helens or","rainier or","kalama"],
    region:"pacific_northwest", type:"river", accidentRate:68, tidalRange:6.0, fogRisk:0.35, trafficLevel:6,
    hazards:["Bar crossing extremely dangerous in swell","Strong river current year-round","Commercial shipping traffic","Debris after spring runoff"] },
  { name:"Willamette River, OR", aliases:["willamette river","willamette","portland or","lake oswego","west linn","oregon city","salem or","corvallis or","albany or","eugene or"],
    region:"pacific_northwest", type:"river", accidentRate:42, tidalRange:2.5, fogRisk:0.30, trafficLevel:5,
    hazards:["Bridge clearances in Portland","Strong current during spring runoff","Debris after storms","Commercial traffic near Portland"] },
  { name:"Coos Bay, OR", aliases:["coos bay","north bend or","coos bay or","charleston or","bandon or","coquille"],
    region:"pacific_northwest", type:"bay", accidentRate:44, tidalRange:5.8, fogRisk:0.45, trafficLevel:4,
    hazards:["Dangerous bar crossing","Dense fog year-round","Strong tidal currents","Commercial fishing traffic"] },
  { name:"Grays Harbor, WA", aliases:["grays harbor","aberdeen wa","hoquiam","westport wa","ocean shores","cosmopolis"],
    region:"pacific_northwest", type:"harbor", accidentRate:52, tidalRange:8.5, fogRisk:0.43, trafficLevel:4,
    hazards:["Dangerous bar crossing at entrance","Dense fog frequent","Strong tidal currents","Limited pilot services"] },
  { name:"Lake Washington, WA", aliases:["lake washington","bellevue","kirkland","redmond wa","renton","mercer island","kenmore","bothell","medina wa"],
    region:"pacific_northwest", type:"lake", accidentRate:36, tidalRange:0, fogRisk:0.22, trafficLevel:6,
    hazards:["I-90 bridge creates current","Cold water year-round","Afternoon winds build","Seaplane traffic near Kenmore Air"] },
  { name:"Hood Canal, WA", aliases:["hood canal","belfair","union wa","allyn","potlatch","hoodsport","shelton wa","brinnon","quilcene"],
    region:"pacific_northwest", type:"canal", accidentRate:34, tidalRange:12.0, fogRisk:0.38, trafficLevel:4,
    hazards:["Extreme tidal range in upper canal","Strong current at the spit","Submarine traffic — navy base","Cold water year-round"] },

  // ── TENNESSEE / KENTUCKY ──
  { name:"Lake Cumberland, KY", aliases:["lake cumberland","somerset ky","monticello ky","burnside ky","jamestown ky","celina","albany ky","burkesville"],
    region:"southeast", type:"lake", accidentRate:39, tidalRange:0, fogRisk:0.15, trafficLevel:6,
    hazards:["Long narrow lake — weather funnels along corridor","Submerged timber at low levels","Steep rocky banks","Houseboat traffic can block view"] },
  { name:"Kentucky Lake / Lake Barkley, TN/KY", aliases:["kentucky lake","lake barkley","land between the lakes","paris tn","murray ky","cadiz ky","benton ky","aurora ky","kuttawa","grand rivers"],
    region:"southeast", type:"lake", accidentRate:36, tidalRange:0, fogRisk:0.17, trafficLevel:5,
    hazards:["Barge traffic on Tennessee River","Submerged structures","Strong winds across open water","Holiday congestion in summer"] },
  { name:"Chickamauga Lake, TN", aliases:["chickamauga lake","chattanooga","hixson","soddy daisy","dayton tn","harrison tn","ooltewah"],
    region:"southeast", type:"lake", accidentRate:44, tidalRange:0, fogRisk:0.16, trafficLevel:6,
    hazards:["Barge traffic on main river channel","Submerged structures","Afternoon thunderstorms","Lock operations at dam"] },
  { name:"Norris Lake, TN", aliases:["norris lake","la follette","jacksboro tn","norris tn","andersonville","helenwood","big ridge"],
    region:"southeast", type:"lake", accidentRate:29, tidalRange:0, fogRisk:0.15, trafficLevel:4,
    hazards:["Submerged tree stumps","Deep clear water","Afternoon thunderstorms","Remote coves with limited cell service"] },
  { name:"Dale Hollow Lake, TN/KY", aliases:["dale hollow lake","dale hollow","celina tn","byrdstown","burkesville ky","clay county tn"],
    region:"southeast", type:"lake", accidentRate:28, tidalRange:0, fogRisk:0.14, trafficLevel:4,
    hazards:["Clear deep water — deceiving distances","Submerged timber","Afternoon thunderstorms","Cliff jumping areas create congestion"] },
  { name:"Center Hill Lake, TN", aliases:["center hill lake","center hill","edgar evins","smithville tn","silver point","gordonsville tn"],
    region:"southeast", type:"lake", accidentRate:31, tidalRange:0, fogRisk:0.15, trafficLevel:5,
    hazards:["Submerged structures","Narrow coves with fast traffic","Afternoon thunderstorms","Variable water levels"] },

  // ── ALABAMA ──
  { name:"Guntersville Lake, AL", aliases:["guntersville lake","guntersville","albertville al","arab al","boaz al","grant al","scottsboro","lake guntersville"],
    region:"southeast", type:"lake", accidentRate:35, tidalRange:0, fogRisk:0.15, trafficLevel:5,
    hazards:["Submerged timber","Strong afternoon winds","Holiday congestion","Barge traffic on main channel"] },
  { name:"Lake Martin, AL", aliases:["lake martin","alex city","alexander city","dadeville","jacksons gap","tallassee","wind creek","kowaliga"],
    region:"southeast", type:"lake", accidentRate:31, tidalRange:0, fogRisk:0.13, trafficLevel:5,
    hazards:["Submerged timber at low water","Rocky shoreline","Afternoon thunderstorms","Holiday congestion"] },
  { name:"Mobile Bay, AL", aliases:["mobile bay","mobile","fairhope","daphne","gulf shores","orange beach al","foley al","spanish fort","malbis"],
    region:"gulf_coast", type:"bay", accidentRate:52, tidalRange:1.9, fogRisk:0.2, trafficLevel:6,
    hazards:["Jubilee events disrupt navigation","Shoaling near delta","Hurricane season risk June–Nov"] },

  // ── ALASKA ──
  { name:"Inside Passage, AK", aliases:["inside passage","ketchikan","juneau","sitka","wrangell","petersburg ak","craig ak","alaska panhandle","southeast alaska","metlakatla","angoon","klawock"],
    region:"pacific_northwest", type:"coastal", accidentRate:52, tidalRange:14.0, fogRisk:0.55, trafficLevel:4,
    hazards:["Extreme tidal range in some areas","Dense fog very frequent","Uncharted rocks in many areas","Cold water — hypothermia in minutes","Glacial calving hazard near glaciers"] },
  { name:"Cook Inlet, AK", aliases:["cook inlet","anchorage","homer ak","kenai ak","soldotna","nikiski","kenai peninsula","wasilla","fritz creek"],
    region:"pacific_northwest", type:"inlet", accidentRate:68, tidalRange:28.0, fogRisk:0.38, trafficLevel:4,
    hazards:["One of world's largest tidal ranges — up to 38ft","Glacial silt reduces visibility","Extreme cold water — immediate hypothermia","Beluga whale areas — slow speed required"] },
  { name:"Resurrection Bay, AK", aliases:["resurrection bay","seward ak","lowell point","caines head","seward alaska","bear glacier"],
    region:"pacific_northwest", type:"bay", accidentRate:36, tidalRange:10.5, fogRisk:0.42, trafficLevel:3,
    hazards:["Cold water year-round","Williwaw winds can develop instantly","Calving glaciers","Sea ice in winter and spring"] },
  { name:"Prince William Sound, AK", aliases:["prince william sound","valdez","cordova","whittier","hinchinbrook","knight island","columbia glacier"],
    region:"pacific_northwest", type:"sound", accidentRate:44, tidalRange:12.0, fogRisk:0.48, trafficLevel:3,
    hazards:["Icebergs from Columbia Glacier","Extreme cold water","Dense fog common","Oil tanker traffic near Valdez","Remote — very limited rescue access"] },

  // ── HAWAII ──
  { name:"Oahu Waters, HI", aliases:["oahu","honolulu","waikiki","pearl harbor","kaneohe bay","kailua hi","hawaii kai","ewa beach","ko olina","haleiwa","north shore oahu","waianae"],
    region:"west_coast", type:"coastal", accidentRate:41, tidalRange:1.8, fogRisk:0.04, trafficLevel:7,
    hazards:["Offshore swells build rapidly","Reef hazards near shore","Trade wind chop on windward side","Military restricted areas near Pearl Harbor"] },
  { name:"Maui Waters, HI", aliases:["maui","lahaina","kihei","maalaea","kaanapali","wailea","pailolo channel","auau channel","molokai","lanai","molokini","ma alaea harbor"],
    region:"west_coast", type:"coastal", accidentRate:38, tidalRange:1.9, fogRisk:0.03, trafficLevel:6,
    hazards:["Pailolo Channel extremely rough in trade winds","Whale season restrictions Dec–May","Reef hazards throughout","Strong currents around Molokini"] },
  { name:"Kona / Big Island Waters, HI", aliases:["kona","big island hawaii","kailua kona","captain cook","keauhou","south kona","north kona","waikoloa","kohala coast","hilo","honokaa"],
    region:"west_coast", type:"coastal", accidentRate:33, tidalRange:1.7, fogRisk:0.03, trafficLevel:5,
    hazards:["Lava entry areas — acidic water","Afternoon Kona winds","Limited harbors on leeward coast","Open ocean swells on windward side"] },

  // ── GENERICS ──
  { name:"Generic Coastal Waters", aliases:[], region:"generic_coastal", type:"coastal", accidentRate:55, tidalRange:3.0, fogRisk:0.2, trafficLevel:5, hazards:["Verify local channel markers","Check local tide tables before departure","Monitor VHF Channel 16 at all times"] },
  { name:"Generic Lake", aliases:[], region:"generic_lake", type:"lake", accidentRate:30, tidalRange:0, fogRisk:0.12, trafficLevel:4, hazards:["Check local weather before departure","File a float plan","Carry required safety equipment"] },
  { name:"Generic River", aliases:[], region:"generic_river", type:"river", accidentRate:40, tidalRange:1.0, fogRisk:0.18, trafficLevel:4, hazards:["Watch for submerged debris","Current varies with rainfall","Low clearance bridges possible"] },
  { name:"Generic Gulf Coast Waters", aliases:[], region:"gulf_coast", type:"coastal", accidentRate:52, tidalRange:1.5, fogRisk:0.16, trafficLevel:5, hazards:["Monitor VHF Ch. 16","Hurricane season June–November","Check tide charts before departure"] },
  { name:"Generic Great Lakes Waters", aliases:[], region:"great_lakes", type:"lake", accidentRate:45, tidalRange:0, fogRisk:0.25, trafficLevel:4, hazards:["No tides but seiches possible","Cold water year-round","Sudden storms common"] },
];


// ─── SEASONAL / WIND DATA ─────────────────────────────────────────────────────
const SEASONAL = {
  gulf_coast:[0.18,0.15,0.14,0.12,0.16,0.28,0.32,0.30,0.35,0.22,0.17,0.16],
  south_florida:[0.10,0.09,0.10,0.12,0.18,0.35,0.38,0.36,0.40,0.28,0.14,0.11],
  north_florida:[0.12,0.11,0.10,0.10,0.14,0.25,0.28,0.26,0.30,0.20,0.13,0.12],
  mid_atlantic:[0.22,0.20,0.18,0.14,0.12,0.14,0.16,0.15,0.18,0.20,0.24,0.25],
  northeast:[0.30,0.28,0.24,0.18,0.14,0.12,0.12,0.13,0.16,0.22,0.28,0.32],
  great_lakes:[0.35,0.32,0.28,0.20,0.15,0.12,0.10,0.11,0.16,0.24,0.32,0.38],
  west_coast:[0.18,0.16,0.14,0.12,0.14,0.16,0.14,0.13,0.14,0.16,0.18,0.19],
  pacific_northwest:[0.30,0.28,0.25,0.20,0.16,0.14,0.12,0.12,0.16,0.22,0.28,0.32],
  southeast:[0.16,0.14,0.13,0.12,0.15,0.24,0.28,0.26,0.30,0.20,0.15,0.15],
  west_mountain:[0.12,0.12,0.14,0.14,0.14,0.16,0.18,0.17,0.15,0.13,0.12,0.12],
  generic_coastal:[0.20,0.18,0.16,0.14,0.14,0.18,0.20,0.19,0.22,0.18,0.18,0.20],
  generic_lake:[0.18,0.16,0.14,0.12,0.12,0.14,0.16,0.15,0.14,0.14,0.16,0.18],
  generic_river:[0.20,0.18,0.18,0.20,0.18,0.16,0.15,0.14,0.15,0.16,0.18,0.20],
};
const WIND_PATTERNS = {
  gulf_coast:[8,9,12,14,12,14,13,12,16,13,10,8],
  south_florida:[9,9,11,13,13,14,13,13,15,13,11,9],
  north_florida:[8,9,11,12,11,12,11,11,14,11,9,8],
  mid_atlantic:[12,12,13,13,12,11,11,11,12,12,13,13],
  northeast:[14,14,15,14,12,11,10,10,12,13,15,15],
  great_lakes:[13,13,14,14,12,11,10,10,12,14,16,14],
  west_coast:[10,10,11,12,13,14,13,12,11,10,10,10],
  pacific_northwest:[12,12,13,12,11,10,9,9,11,13,14,13],
  southeast:[9,10,11,12,11,12,11,11,13,11,9,9],
  west_mountain:[8,8,10,11,11,13,12,11,10,9,8,8],
  generic_coastal:[11,11,12,13,12,12,11,11,13,12,12,11],
  generic_lake:[9,9,10,11,11,12,11,10,11,10,10,9],
  generic_river:[8,8,10,11,10,11,10,10,11,10,9,8],
};
const SEASON_NAMES = ["Winter","Winter","Spring","Spring","Spring","Summer","Summer","Summer","Fall","Fall","Fall","Winter"];
const MONTH_NAMES  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── SMART LOCATION MATCHER ───────────────────────────────────────────────────
function matchLocation(input) {
  if (!input.trim()) return null;
  const q = input.toLowerCase().trim().replace(/[.,]/g,"");
  const generics = WATERWAYS.filter(w => w.name.startsWith("Generic"));
  const named    = WATERWAYS.filter(w => !w.name.startsWith("Generic"));

  // 1. Exact alias match
  for (const w of named) {
    if (w.aliases.includes(q)) return w;
  }
  // 2. Alias starts-with
  for (const w of named) {
    if (w.aliases.some(a => a.startsWith(q) || q.startsWith(a))) return w;
  }
  // 3. Name match
  for (const w of named) {
    if (w.name.toLowerCase().includes(q)) return w;
  }
  // 4. Any alias contains query word
  const words = q.split(/\s+/).filter(w => w.length >= 3);
  let best = null, bestScore = 0;
  for (const w of named) {
    let score = 0;
    for (const word of words) {
      if (w.aliases.some(a => a.includes(word))) score += 3;
      if (w.name.toLowerCase().includes(word)) score += 2;
    }
    if (score > bestScore) { bestScore = score; best = w; }
  }
  if (bestScore >= 2) return best;

  // 5. Generic fallback by keyword
  if (/lake|reservoir|pond/.test(q)) return generics.find(w => w.name === "Generic Lake");
  if (/river|creek|stream|bayou/.test(q)) return generics.find(w => w.name === "Generic River");
  return generics.find(w => w.name === "Generic Coastal Waters");
}

// ─── ADVISORIES ───────────────────────────────────────────────────────────────
function buildAdvisory(risk, score, season, region, windMph) {
  if (risk >= 60) return `DANGEROUS conditions this ${season}. Elevated accident history combined with seasonal risk factors make this a high-alert day. Experienced operators only — strongly consider postponing.`;
  if (risk >= 40) return `Elevated risk detected for this area in ${season}. Ensure all USCG-required safety equipment is aboard, file a float plan, and monitor VHF Ch. 16 continuously.`;
  if (risk >= 25) return `Moderate conditions. ${windMph > 15 ? "Wind speeds warrant caution — watch for building chop." : "Generally manageable conditions."} Standard safety protocols apply and always monitor weather changes.`;
  if (score >= 8) return `Excellent boating conditions for this region in ${season}. Great day on the water — maintain standard safety practices and stay aware of vessel traffic.`;
  return `Favorable conditions overall. Typical ${season.toLowerCase()} patterns for this waterway. Always carry required safety gear and check local NOTAMs before departure.`;
}
function bestTimeOfDay(region, month) {
  if (["pacific_northwest","west_coast","northeast","mid_atlantic"].includes(region) && (month<=4||month>=10)) return "Midday (11am–3pm) after morning fog lifts";
  if (["gulf_coast","south_florida","west_coast","west_mountain"].includes(region) && month>=5 && month<=9) return "Morning (7am–11am) before afternoon winds build";
  if (region==="great_lakes" && month>=6 && month<=8) return "Early morning (6am–10am) before afternoon squalls";
  return "Morning to early afternoon (8am–1pm)";
}

// ─── RISK ENGINE ──────────────────────────────────────────────────────────────
function computeRisk(waterway, dateStr, overrides, mode) {
  const date = new Date(dateStr);
  const month = date.getMonth();
  const isWeekend = [0,6].includes(date.getDay());
  const seasonalRisk = SEASONAL[waterway.region]?.[month] ?? 0.18;
  const windMph = WIND_PATTERNS[waterway.region]?.[month] ?? 11;
  const season = SEASON_NAMES[month];
  const monthName = MONTH_NAMES[month];

  let windRisk, tideRisk, visRisk, accRisk, hazRisk;
  let windLabel, tideLabel, visLabel, accLabel, hazLabel;
  let windDetail, tideDetail, visDetail, accDetail, hazDetail;

  if (mode === "manual" && overrides) {
    const wv = overrides.wind;
    windRisk   = Math.round(wv * 2.2);
    windLabel  = wv<=2?"Calm (0-5 mph)":wv<=4?"Light (6-12 mph)":wv<=6?"Moderate (13-20 mph)":wv<=8?"Fresh (21-30 mph)":"Strong (31+ mph)";
    windDetail = "Manual override applied";
    const tv = overrides.tide;
    tideRisk   = Math.round(tv * 1.8);
    tideLabel  = tv<=2?"Slack / Low tide":tv<=5?"Moderate tidal flow":tv<=7?"Active tidal change":"Extreme tidal range";
    tideDetail = "Manual override applied";
    const vv = overrides.visibility;
    visRisk    = Math.round((10-vv)*2.0);
    visLabel   = vv>=8?"Clear & sunny":vv>=6?"Partly cloudy":vv>=4?"Overcast":vv>=2?"Foggy/hazy":"Dense fog";
    visDetail  = "Manual override applied";
    const av = overrides.accidents;
    accRisk    = Math.round(av*2.5);
    accLabel   = `${Math.round(av*4)} incidents (historical estimate)`;
    accDetail  = "Based on manual frequency setting";
    const hv = isWeekend ? Math.min(overrides.accidents+2,10) : overrides.accidents;
    hazRisk    = Math.round(hv*1.6);
    hazLabel   = hv<=3?"Low traffic":hv<=6?"Moderate traffic":"High traffic & congestion";
    hazDetail  = isWeekend?"Weekend — elevated recreational traffic":"Weekday — normal traffic levels";
  } else {
    windRisk   = windMph<8?4:windMph<12?8:windMph<18?13:windMph<25?20:27;
    windLabel  = windMph<8?`Calm (${windMph} mph avg)`:windMph<12?`Light (${windMph} mph avg)`:windMph<18?`Moderate (${windMph} mph avg)`:windMph<25?`Fresh (${windMph} mph avg)`:`Strong (${windMph} mph avg)`;
    windDetail = `Typical ${monthName} conditions for this region`;
    const tr = waterway.tidalRange;
    tideRisk   = tr===0?2:tr<2?5:tr<4?10:tr<6?16:tr<9?22:28;
    tideLabel  = tr===0?"No tidal influence (freshwater)":tr<2?`Low (${tr}ft range)`:tr<4?`Moderate (${tr}ft range)`:tr<6?`High (${tr}ft range)`:`Extreme (${tr}ft range)`;
    tideDetail = tr===0?"Lake — monitor wind-driven waves instead":"Tidal currents increase near inlets and narrows";
    const fg = waterway.fogRisk;
    const highFog = (["west_coast","pacific_northwest"].includes(waterway.region)&&month>=4&&month<=8)||(["northeast","mid_atlantic"].includes(waterway.region)&&month>=2&&month<=5);
    const effFog = highFog ? fg*1.4 : fg;
    visRisk    = Math.round(effFog*40);
    visLabel   = effFog<0.1?"Clear, low fog probability":effFog<0.2?"Occasional morning fog":effFog<0.35?"Moderate fog risk":effFog<0.5?"Frequent fog":"High fog frequency";
    visDetail  = highFog?`Peak fog season for this region in ${monthName}`:`Historical fog frequency: ${Math.round(effFog*100)}% of days`;
    const ar = waterway.accidentRate;
    accRisk    = Math.round((ar/100)*25);
    accLabel   = ar<35?`Low (~${ar} per 100k trips)`:ar<60?`Moderate (~${ar} per 100k trips)`:ar<80?`Elevated (~${ar} per 100k trips)`:`High (~${ar} per 100k trips)`;
    accDetail  = "Based on USCG accident data for this waterway";
    const tl = waterway.trafficLevel+(isWeekend?1.5:0);
    hazRisk    = Math.round(seasonalRisk*30+(tl/10)*8);
    hazLabel   = tl<5?"Low traffic, off-season":tl<7?"Moderate seasonal traffic":tl<9?"High recreational traffic":"Peak season, very congested";
    hazDetail  = `${season} ${isWeekend?"weekend":"weekday"} — ${Math.round(seasonalRisk*100)}% seasonal factor`;
  }

  const rawRisk = windRisk*0.25+tideRisk*0.20+visRisk*0.18+accRisk*0.22+hazRisk*0.15;
  const expMod  = (mode==="manual"&&overrides) ? 1+(5-overrides.experience)*0.035 : 1.0;
  const wreckProbability = Math.min(Math.max(Math.round(rawRisk*expMod),3),97);
  const boatDayScore = Math.min(Math.max(Math.round(
    (Math.max(10-Math.round(windRisk/3),1)*0.3+Math.max(10-Math.round(tideRisk/3),1)*0.2+Math.max(10-Math.round(visRisk/3),1)*0.3+Math.round(10-seasonalRisk*20)*0.2)
  ),1),10);
  const risk_level = wreckProbability<15?"LOW":wreckProbability<35?"MODERATE":wreckProbability<60?"HIGH":"DANGEROUS";
  const confidence = waterway.name.startsWith("Generic") ? 58 : 76+Math.round(Math.random()*10);

  return {
    location_confirmed: waterway.name,
    date_analyzed: date.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),
    wreck_probability: wreckProbability,
    boat_day_score: boatDayScore,
    risk_level,
    conditions:{
      wind:               {label:windLabel, risk_contribution:windRisk, detail:windDetail},
      tides:              {label:tideLabel, risk_contribution:tideRisk, detail:tideDetail},
      visibility:         {label:visLabel,  risk_contribution:visRisk,  detail:visDetail},
      historical_accidents:{label:accLabel, risk_contribution:accRisk,  detail:accDetail},
      seasonal_hazards:   {label:hazLabel,  risk_contribution:hazRisk,  detail:hazDetail},
    },
    known_hazards: waterway.hazards,
    advisory: buildAdvisory(wreckProbability,boatDayScore,season,waterway.region,windMph),
    best_time_of_day: bestTimeOfDay(waterway.region,month),
    data_sources:["USCG Accident Reports (2015–2024)","NOAA Tides & Currents","NWS Climatological Data","Regional Coast Guard Sector"],
    confidence,
    isGeneric: waterway.name.startsWith("Generic"),
    windMph,
    season,
  };
}

// ─── ANIMATED NUMBER ──────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration=1400 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null), rafRef = useRef(null);
  useEffect(() => {
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const go = ts => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts-startRef.current)/duration,1);
      setDisplay(Math.round((1-Math.pow(1-p,4))*target));
      if (p<1) rafRef.current = requestAnimationFrame(go);
    };
    rafRef.current = requestAnimationFrame(go);
    return () => cancelAnimationFrame(rafRef.current);
  },[target]);
  return <span>{display}</span>;
}

// ─── GAUGE ────────────────────────────────────────────────────────────────────
function GaugeMeter({ value, max, color, size=180 }) {
  const r=58, cx=size/2, cy=size/2+8, sa=-215, sw=250;
  const pct=Math.min(value/max,1), ea=sa+sw*pct;
  const uid=color.replace(/[^a-z0-9]/gi,"");
  function pol(a,r){const rad=(a*Math.PI)/180;return[cx+r*Math.cos(rad),cy+r*Math.sin(rad)];}
  function arc(a1,a2,r){const[sx,sy]=pol(a1,r),[ex,ey]=pol(a2,r),l=Math.abs(a2-a1)>180?1:0;return`M${sx} ${sy}A${r} ${r} 0 ${l} 1 ${ex} ${ey}`;}
  const ticks=[0,.2,.4,.6,.8,1];
  return (
    <svg viewBox={`0 0 ${size} ${size-14}`} style={{width:size,height:size-14}}>
      <defs>
        <filter id={`glow${uid}`}><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id={`grad${uid}`} gradientUnits="userSpaceOnUse" x1={pol(sa,r)[0]} y1={pol(sa,r)[1]} x2={pol(ea,r)[0]} y2={pol(ea,r)[1]}>
          <stop offset="0%" stopColor={color} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </linearGradient>
      </defs>
      {/* Track */}
      <path d={arc(sa,sa+sw,r)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="11" strokeLinecap="round"/>
      {/* Subtle second track */}
      <path d={arc(sa,sa+sw,r)} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="16" strokeLinecap="round"/>
      {/* Fill */}
      {pct>0.01&&<path d={arc(sa,ea,r)} fill="none" stroke={`url(#grad${uid})`} strokeWidth="11" strokeLinecap="round" filter={`url(#glow${uid})`}/>}
      {/* Ticks */}
      {ticks.map((t,i)=>{const a=sa+sw*t,[x1,y1]=pol(a,46),[x2,y2]=pol(a,40);return<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>;})}
      {/* Dot at end of fill */}
      {pct>0.02&&pct<0.99&&(()=>{const[dx,dy]=pol(ea,r);return<circle cx={dx} cy={dy} r="5" fill={color} filter={`url(#glow${uid})`}/>;})()}
    </svg>
  );
}

// ─── FACTOR BAR ───────────────────────────────────────────────────────────────
function FactorBar({ label, value, detail, delay=0 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(()=>{const t=setTimeout(()=>setAnimated(true),delay);return()=>clearTimeout(t);},[delay]);
  const color = value<10?"#34d399":value<18?"#fbbf24":"#f87171";
  const pct = Math.min((value/30)*100,100);
  return (
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <span style={{fontSize:12,color:"rgba(200,220,255,0.85)",fontFamily:"'Space Mono',monospace",letterSpacing:"0.02em"}}>{label}</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color,fontFamily:"'Space Mono',monospace",fontWeight:700}}>+{value} pts</span>
          <div style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${color}33`,display:"flex",alignItems:"center",justifyContent:"center",background:`${color}11`}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}`}}/>
          </div>
        </div>
      </div>
      <div style={{height:6,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden",marginBottom:5,position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(90deg,transparent,transparent 20%,rgba(255,255,255,0.02) 20%,rgba(255,255,255,0.02) 20.5%)"}}/>
        <div style={{width:animated?`${pct}%`:"0%",height:"100%",background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:3,boxShadow:`0 0 10px ${color}66`,transition:"width 1.2s cubic-bezier(0.34,1.56,0.64,1)"}}/>
      </div>
      <div style={{fontSize:11,color:"rgba(140,170,220,0.5)",lineHeight:1.4,fontStyle:"italic"}}>{detail}</div>
    </div>
  );
}

// ─── AUTOCOMPLETE INPUT ───────────────────────────────────────────────────────
function LocationInput({ value, onChange }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  function handleChange(e) {
    const v = e.target.value;
    onChange(v);
    if (v.length < 2) { setSuggestions([]); setOpen(false); return; }
    const q = v.toLowerCase();
    const matches = WATERWAYS
      .filter(w => !w.name.startsWith("Generic") && (
        w.name.toLowerCase().includes(q) ||
        w.aliases.some(a => a.includes(q))
      )).slice(0,6);
    setSuggestions(matches);
    setOpen(matches.length > 0);
  }

  function handleSelect(w) {
    onChange(w.name);
    setOpen(false);
    setSuggestions([]);
  }

  const typeIcon = {bay:"🌊",inlet:"⚓",coastal:"🏖️",sound:"🌊",lake:"🏞️",river:"🌿",harbor:"⚓",intracoastal:"🚤"};

  return (
    <div style={{position:"relative"}}>
      <div style={{position:"relative"}}>
        <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,pointerEvents:"none"}}>🔍</span>
        <input type="text" value={value} onChange={handleChange}
          onFocus={()=>{setFocused(true);if(suggestions.length>0)setOpen(true);}}
          onBlur={()=>{setFocused(false);setTimeout(()=>setOpen(false),160);}}
          placeholder="Type a city, bay, lake, or waterway..."
          style={{
            width:"100%", background:focused?"rgba(0,15,40,0.95)":"rgba(0,10,30,0.8)",
            border:`1px solid ${focused?"rgba(99,179,255,0.5)":"rgba(60,120,220,0.2)"}`,
            borderRadius:14, color:"#e8f2ff", padding:"14px 16px 14px 42px",
            fontSize:14, fontFamily:"'Syne',sans-serif",
            transition:"all 0.2s", boxShadow:focused?"0 0 0 3px rgba(59,130,246,0.12)":"none",
            boxSizing:"border-box",
          }}
        />
      </div>
      {open && (
        <div style={{
          position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:200,
          background:"rgba(6,16,40,0.98)",border:"1px solid rgba(60,120,220,0.2)",
          borderRadius:14,overflow:"hidden",backdropFilter:"blur(20px)",
          boxShadow:"0 20px 60px rgba(0,0,0,0.6)",
        }}>
          {suggestions.map((w,i)=>(
            <div key={i} onMouseDown={()=>handleSelect(w)}
              style={{padding:"12px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:i<suggestions.length-1?"1px solid rgba(60,120,220,0.08)":"none",transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.12)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:18}}>{typeIcon[w.type]||"🗺️"}</span>
                <div>
                  <div style={{fontSize:13,color:"#d4e8ff",fontWeight:600}}>{w.name}</div>
                  <div style={{fontSize:10,color:"rgba(120,160,220,0.5)",fontFamily:"'Space Mono',monospace",marginTop:1,textTransform:"uppercase"}}>{w.type} · {w.region.replace(/_/g," ")}</div>
                </div>
              </div>
              <div style={{fontSize:10,color:w.accidentRate>70?"#f87171":w.accidentRate>45?"#fbbf24":"#34d399",fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                {w.accidentRate>70?"HIGH RISK":w.accidentRate>45?"MODERATE":"LOW"} AREA
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── WAVE ANIMATION ───────────────────────────────────────────────────────────
function WaveBackground() {
  return (
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:120,overflow:"hidden",opacity:0.15,pointerEvents:"none"}}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{width:"100%",height:"100%"}}>
        <path d="M0,60 C360,100 720,20 1080,60 C1260,80 1350,40 1440,60 L1440,120 L0,120Z" fill="#3b82f6" opacity="0.5">
          <animate attributeName="d" dur="8s" repeatCount="indefinite"
            values="M0,60 C360,100 720,20 1080,60 C1260,80 1350,40 1440,60 L1440,120 L0,120Z;M0,40 C360,20 720,80 1080,40 C1260,20 1350,70 1440,40 L1440,120 L0,120Z;M0,60 C360,100 720,20 1080,60 C1260,80 1350,40 1440,60 L1440,120 L0,120Z"/>
        </path>
        <path d="M0,80 C360,50 720,100 1080,70 C1260,55 1350,85 1440,70 L1440,120 L0,120Z" fill="#0ea5e9" opacity="0.4">
          <animate attributeName="d" dur="10s" repeatCount="indefinite"
            values="M0,80 C360,50 720,100 1080,70 C1260,55 1350,85 1440,70 L1440,120 L0,120Z;M0,60 C360,90 720,50 1080,80 C1260,95 1350,55 1440,80 L1440,120 L0,120Z;M0,80 C360,50 720,100 1080,70 C1260,55 1350,85 1440,70 L1440,120 L0,120Z"/>
        </path>
      </svg>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function BoatRiskApp() {
  const [location, setLocation]     = useState("");
  const [date, setDate]             = useState(()=>new Date().toISOString().split("T")[0]);
  const [result, setResult]         = useState(null);
  const [mode, setMode]             = useState("auto");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus]   = useState(null);
  const [analyzing, setAnalyzing]   = useState(false);
  const [manualOverrides, setManualOverrides] = useState({wind:5,tide:5,visibility:7,accidents:3,experience:7});
  const resultsRef = useRef(null);

  function setOverride(key,val){setManualOverrides(p=>({...p,[key]:val}));}

  async function autofill() {
    setGeoLoading(true); setGeoStatus(null);
    if (!navigator.geolocation){setGeoStatus("error");setGeoLoading(false);return;}
    navigator.geolocation.getCurrentPosition(
      async pos=>{
        try{
          const res=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
          const data=await res.json();
          const addr=data.address||{};
          const place=addr.body_of_water||addr.bay||addr.lake||addr.river||[addr.city||addr.town||addr.county,addr.state].filter(Boolean).join(", ");
          setLocation(place||`${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        }catch{setLocation(`${pos.coords.latitude.toFixed(4)}N`);}
        setDate(new Date().toISOString().split("T")[0]);
        setGeoStatus("success");setGeoLoading(false);
      },
      ()=>{setGeoStatus("error");setGeoLoading(false);},
      {timeout:8000}
    );
  }

  function analyze() {
    const waterway = matchLocation(location);
    if (!waterway) return;
    setAnalyzing(true);
    setTimeout(()=>{
      const r = computeRisk(waterway, date, mode==="manual"?manualOverrides:null, mode);
      setResult(r);
      setAnalyzing(false);
      setTimeout(()=>resultsRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),120);
    }, 600);
  }

  function getRiskColor(level){return{LOW:"#34d399",MODERATE:"#fbbf24",HIGH:"#f97316",DANGEROUS:"#ef4444"}[level]||"#34d399";}
  function getScoreColor(s){return s>=8?"#34d399":s>=6?"#86efac":s>=4?"#fbbf24":"#f87171";}

  const riskColor  = result?getRiskColor(result.risk_level):"#34d399";
  const scoreColor = result?getScoreColor(result.boat_day_score):"#34d399";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{background:#030810;overflow-x:hidden;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .fade-up{animation:fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both;}
        .fade-up-2{animation:fadeUp 0.6s 0.15s cubic-bezier(0.22,1,0.36,1) both;}
        .fade-up-3{animation:fadeUp 0.6s 0.3s cubic-bezier(0.22,1,0.36,1) both;}
        input:focus,select:focus{outline:none!important;}
        .analyze-btn:hover:not(:disabled){transform:translateY(-3px)!important;box-shadow:0 16px 48px rgba(59,130,246,0.45)!important;}
        .analyze-btn:active:not(:disabled){transform:translateY(0)!important;}
        .mode-btn:hover{opacity:1!important;}
        .card{background:rgba(8,18,48,0.7);border:1px solid rgba(60,120,220,0.12);border-radius:20px;padding:24px;backdrop-filter:blur(16px);}
        .card:hover{border-color:rgba(60,120,220,0.22);transition:border-color 0.3s;}
        input[type=range]{-webkit-appearance:none;height:5px;border-radius:3px;background:rgba(255,255,255,0.08);}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#3b82f6;cursor:pointer;box-shadow:0 0 8px rgba(59,130,246,0.7);transition:transform 0.15s;}
        input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2);}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.6);cursor:pointer;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:rgba(60,120,220,0.25);border-radius:3px;}
        .loading-ring{width:20px;height:20px;border:2px solid rgba(255,255,255,0.15);border-top-color:#60a5fa;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;}
      `}</style>

      <div style={{minHeight:"100vh",background:"linear-gradient(175deg,#030810 0%,#050d1f 40%,#030c1a 100%)",fontFamily:"'Syne',sans-serif",color:"#c5d8f0",paddingBottom:100,position:"relative",overflow:"hidden"}}>

        {/* Background orbs */}
        <div style={{position:"fixed",top:-200,left:-200,width:600,height:600,background:"radial-gradient(circle,rgba(30,80,200,0.08) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
        <div style={{position:"fixed",bottom:-200,right:-200,width:500,height:500,background:"radial-gradient(circle,rgba(0,150,200,0.06) 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>

        {/* ── HEADER ── */}
        <div style={{position:"relative",zIndex:1,overflow:"hidden"}}>
          <WaveBackground/>
          <div style={{padding:"60px 24px 52px",textAlign:"center",position:"relative"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:100,padding:"6px 16px",marginBottom:20}}>
              <span style={{fontSize:14}}>⚓</span>
              <span style={{fontSize:11,letterSpacing:"0.25em",color:"rgba(147,197,253,0.8)",fontFamily:"'Space Mono',monospace",textTransform:"uppercase"}}>Maritime Safety Intelligence</span>
            </div>
            <h1 style={{fontSize:"clamp(48px,9vw,88px)",fontWeight:800,lineHeight:0.95,marginBottom:16,letterSpacing:"-0.03em"}}>
              <span style={{background:"linear-gradient(135deg,#ffffff 20%,#93c5fd 60%,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>BOAT DAY</span>
              <br/>
              <span style={{background:"linear-gradient(135deg,#60a5fa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>RISK MODEL</span>
            </h1>
            <p style={{fontSize:15,color:"rgba(148,185,240,0.6)",maxWidth:460,margin:"0 auto",lineHeight:1.6}}>
              Enter any US waterway to instantly assess wreck probability, conditions, and safety rating
            </p>
          </div>
        </div>

        {/* ── INPUT CARD ── */}
        <div style={{maxWidth:660,margin:"0 auto",padding:"0 20px",position:"relative",zIndex:1}}>
          <div className="card fade-up" style={{padding:"28px 28px 24px",boxShadow:"0 24px 80px rgba(0,0,0,0.4)"}}>

            {/* Mode Toggle */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,150,220,0.5)",fontFamily:"'Space Mono',monospace"}}>INPUT MODE</div>
              <div style={{display:"flex",background:"rgba(0,8,24,0.8)",border:"1px solid rgba(60,120,220,0.15)",borderRadius:12,padding:4,gap:3}}>
                {[["auto","🤖 AUTO"],["manual","🎛 MANUAL"]].map(([m,label])=>(
                  <button key={m} className="mode-btn" onClick={()=>setMode(m)} style={{
                    padding:"8px 20px",borderRadius:9,border:"none",cursor:"pointer",
                    fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:"0.1em",fontWeight:700,transition:"all 0.2s",
                    background:mode===m?"linear-gradient(135deg,#1d4ed8,#0284c7)":"transparent",
                    color:mode===m?"#fff":"rgba(140,175,240,0.4)",
                    boxShadow:mode===m?"0 4px 16px rgba(0,100,220,0.4)":"none",
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div style={{marginBottom:16}}>
              <label style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,150,220,0.5)",fontFamily:"'Space Mono',monospace",display:"block",marginBottom:8}}>LOCATION / WATERWAY</label>
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1}}><LocationInput value={location} onChange={setLocation}/></div>
                <button onClick={autofill} disabled={geoLoading} title="Auto-detect my location"
                  style={{flexShrink:0,width:52,height:52,fontSize:geoLoading?14:22,
                    background:geoStatus==="success"?"rgba(52,211,153,0.12)":geoStatus==="error"?"rgba(248,113,113,0.1)":"rgba(29,78,216,0.15)",
                    border:`1px solid ${geoStatus==="success"?"rgba(52,211,153,0.35)":geoStatus==="error"?"rgba(248,113,113,0.3)":"rgba(60,120,220,0.25)"}`,
                    borderRadius:14,cursor:geoLoading?"wait":"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",
                    animation:geoLoading?"pulse 1s ease infinite":"none",
                  }}>
                  {geoLoading?<div className="loading-ring"/>:geoStatus==="success"?"✅":geoStatus==="error"?"❌":"📍"}
                </button>
              </div>
              <div style={{marginTop:7,fontSize:11,fontFamily:"'Space Mono',monospace",minHeight:16}}>
                {geoStatus==="success"&&<span style={{color:"#34d399"}}>✓ Location & date auto-filled from device</span>}
                {geoStatus==="error"&&<span style={{color:"#f87171"}}>✗ Access denied — type your location manually</span>}
                {!geoStatus&&<span style={{color:"rgba(100,140,200,0.35)"}}>Tap 📍 to auto-fill · Start typing for suggestions</span>}
              </div>
            </div>

            {/* Date */}
            <div style={{marginBottom:24}}>
              <label style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,150,220,0.5)",fontFamily:"'Space Mono',monospace",display:"block",marginBottom:8}}>DATE</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",background:"rgba(0,8,24,0.8)",border:"1px solid rgba(60,120,220,0.2)",borderRadius:14,color:"#e0eeff",padding:"13px 16px",fontSize:14,fontFamily:"'Syne',sans-serif"}}/>
            </div>

            {/* Manual Sliders */}
            {mode==="manual"&&(
              <div style={{background:"rgba(0,8,24,0.6)",border:"1px solid rgba(60,120,220,0.12)",borderRadius:16,padding:"20px 20px 14px",marginBottom:24}}>
                <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(100,150,220,0.45)",fontFamily:"'Space Mono',monospace",marginBottom:18}}>🎛 MANUAL CONDITION OVERRIDES</div>
                {[
                  {key:"wind",      label:"Wind Speed",           low:"Calm",    high:"Gale",   icon:"🌬"},
                  {key:"tide",      label:"Tide Intensity",       low:"Slack",   high:"Extreme",icon:"🌊"},
                  {key:"visibility",label:"Visibility",           low:"Foggy",   high:"Clear",  icon:"☀️"},
                  {key:"accidents", label:"Historical Accidents", low:"Rare",    high:"Frequent",icon:"📋"},
                  {key:"experience",label:"Operator Experience",  low:"Novice",  high:"Expert", icon:"🧭"},
                ].map(({key,label,low,high,icon})=>{
                  const val=manualOverrides[key];
                  const color=(key==="experience"||key==="visibility")?(val>=7?"#34d399":val>=4?"#fbbf24":"#f87171"):(val<=3?"#34d399":val<=6?"#fbbf24":"#f87171");
                  return(
                    <div key={key} style={{marginBottom:18}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                        <span style={{fontSize:13,color:"rgba(190,215,255,0.8)"}}>{icon} {label}</span>
                        <span style={{fontSize:12,fontFamily:"'Space Mono',monospace",color,fontWeight:700,background:`${color}15`,padding:"2px 8px",borderRadius:6}}>{val}/10</span>
                      </div>
                      <input type="range" min={1} max={10} value={val} onChange={e=>setOverride(key,+e.target.value)} style={{width:"100%",accentColor:color,cursor:"pointer"}}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"rgba(100,140,200,0.3)",marginTop:4}}><span>{low}</span><span>{high}</span></div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Analyze Button */}
            <button className="analyze-btn" onClick={analyze} disabled={analyzing||!location.trim()} style={{
              width:"100%",padding:"16px",border:"none",borderRadius:14,
              background:!location.trim()?"rgba(30,50,90,0.4)":"linear-gradient(135deg,#1d4ed8 0%,#0284c7 50%,#0ea5e9 100%)",
              color:!location.trim()?"rgba(130,160,220,0.25)":"#fff",
              fontSize:15,fontWeight:700,fontFamily:"'Syne',sans-serif",letterSpacing:"0.1em",
              cursor:!location.trim()?"not-allowed":"pointer",transition:"all 0.25s",
              boxShadow:location.trim()?"0 8px 32px rgba(29,78,216,0.35)":"none",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            }}>
              {analyzing?<><div className="loading-ring"/><span>ANALYZING...</span></>:<><span>ANALYZE RISK</span><span style={{fontSize:18}}>→</span></>}
            </button>
          </div>
        </div>

        {/* ── RESULTS ── */}
        {result&&(
          <div ref={resultsRef} style={{maxWidth:900,margin:"40px auto 0",padding:"0 20px",position:"relative",zIndex:1}}>

            {result.isGeneric&&(
              <div className="fade-up" style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:14,padding:"12px 18px",marginBottom:20,fontSize:12,color:"rgba(251,191,36,0.75)",fontFamily:"'Space Mono',monospace",display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:16}}>⚠</span>
                <span>Location not in database — showing estimates for a generic {result.location_confirmed.toLowerCase().replace("generic ","")}.  Try a specific named waterway for full precision.</span>
              </div>
            )}

            {/* Location banner */}
            <div className="fade-up card" style={{marginBottom:16,padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12, background:"rgba(8,20,55,0.8)"}}>
              <div>
                <div style={{fontSize:11,letterSpacing:"0.15em",color:"rgba(100,150,220,0.5)",fontFamily:"'Space Mono',monospace",marginBottom:4}}>ANALYSIS COMPLETE</div>
                <div style={{fontSize:18,fontWeight:700,color:"#e8f4ff"}}>{result.location_confirmed}</div>
                <div style={{fontSize:12,color:"rgba(140,180,240,0.5)",fontFamily:"'Space Mono',monospace",marginTop:3}}>{result.date_analyzed}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                <div style={{
                  background:`linear-gradient(135deg,${riskColor}22,${riskColor}11)`,
                  border:`1px solid ${riskColor}45`,borderRadius:12,padding:"8px 18px",
                  fontSize:13,fontWeight:700,fontFamily:"'Space Mono',monospace",
                  color:riskColor,letterSpacing:"0.14em",
                  boxShadow:`0 0 20px ${riskColor}22`,
                }}>{result.risk_level} RISK</div>
                <div style={{fontSize:11,color:"rgba(120,160,210,0.4)",fontFamily:"'Space Mono',monospace"}}>{result.season} · {result.windMph} mph avg wind</div>
              </div>
            </div>

            {/* ── MAIN GAUGES ── */}
            <div className="fade-up-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              {[
                {label:"WRECK PROBABILITY",value:result.wreck_probability,max:100,color:riskColor,unit:"%",sub:"chance of incident"},
                {label:"BOAT DAY RATING",value:result.boat_day_score,max:10,color:scoreColor,unit:"/10",sub:"overall conditions"},
              ].map(({label,value,max,color,unit,sub})=>(
                <div key={label} className="card" style={{textAlign:"center",padding:"32px 24px 24px",background:"rgba(6,15,42,0.85)",position:"relative",overflow:"hidden"}}>
                  {/* Glow bg */}
                  <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:200,height:200,background:`radial-gradient(circle,${color}0a 0%,transparent 70%)`,pointerEvents:"none"}}/>
                  <div style={{fontSize:10,letterSpacing:"0.22em",color:"rgba(140,175,240,0.4)",fontFamily:"'Space Mono',monospace",marginBottom:12}}>{label}</div>
                  <div style={{display:"flex",justifyContent:"center",position:"relative"}}>
                    <GaugeMeter value={value} max={max} color={color} size={180}/>
                    <div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",textAlign:"center",whiteSpace:"nowrap"}}>
                      <div style={{fontSize:48,fontWeight:800,color,filter:`drop-shadow(0 0 16px ${color}88)`,lineHeight:1,letterSpacing:"-0.02em"}}>
                        <AnimatedNumber target={value}/><span style={{fontSize:unit==="%"?28:22,opacity:0.6,fontWeight:700}}>{unit}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"rgba(140,175,240,0.45)",marginTop:4,letterSpacing:"0.05em"}}>{sub}</div>
                </div>
              ))}
            </div>

            {/* ── FACTOR BREAKDOWN ── */}
            <div className="fade-up-3 card" style={{marginBottom:16,background:"rgba(6,15,42,0.85)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
                <div style={{fontSize:10,letterSpacing:"0.22em",color:"rgba(100,150,220,0.45)",fontFamily:"'Space Mono',monospace"}}>RISK FACTOR BREAKDOWN</div>
                <div style={{fontSize:10,color:"rgba(100,140,200,0.35)",fontFamily:"'Space Mono',monospace"}}>MAX 30 PTS PER FACTOR</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"0 40px"}}>
                <div>
                  <FactorBar delay={100} label="🌬 Wind Conditions"    value={result.conditions.wind.risk_contribution}                detail={`${result.conditions.wind.label} · ${result.conditions.wind.detail}`}/>
                  <FactorBar delay={200} label="🌊 Tidal Conditions"   value={result.conditions.tides.risk_contribution}               detail={`${result.conditions.tides.label} · ${result.conditions.tides.detail}`}/>
                  <FactorBar delay={300} label="☀️ Visibility / Sky"   value={result.conditions.visibility.risk_contribution}          detail={`${result.conditions.visibility.label} · ${result.conditions.visibility.detail}`}/>
                </div>
                <div>
                  <FactorBar delay={200} label="📋 Historical Incidents" value={result.conditions.historical_accidents.risk_contribution} detail={`${result.conditions.historical_accidents.label} · ${result.conditions.historical_accidents.detail}`}/>
                  <FactorBar delay={300} label="⚠️ Seasonal Hazards"   value={result.conditions.seasonal_hazards.risk_contribution}    detail={`${result.conditions.seasonal_hazards.label} · ${result.conditions.seasonal_hazards.detail}`}/>
                </div>
              </div>
            </div>

            {/* ── BOTTOM ROW ── */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

              {/* Hazards */}
              <div className="card" style={{background:"rgba(6,15,42,0.85)"}}>
                <div style={{fontSize:10,letterSpacing:"0.22em",color:"rgba(100,150,220,0.45)",fontFamily:"'Space Mono',monospace",marginBottom:18}}>KNOWN HAZARDS</div>
                {result.known_hazards.map((h,i)=>(
                  <div key={i} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
                    <div style={{width:24,height:24,borderRadius:8,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                      <span style={{color:"#f59e0b",fontSize:10}}>!</span>
                    </div>
                    <span style={{fontSize:13,color:"rgba(190,215,255,0.75)",lineHeight:1.55}}>{h}</span>
                  </div>
                ))}
                <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid rgba(60,120,220,0.1)"}}>
                  <div style={{fontSize:10,letterSpacing:"0.15em",color:"rgba(100,150,220,0.4)",fontFamily:"'Space Mono',monospace",marginBottom:8}}>BEST TIME TO GO</div>
                  <div style={{fontSize:13,color:"#86efac",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>🕐</span> {result.best_time_of_day}
                  </div>
                </div>
              </div>

              {/* Advisory */}
              <div className="card" style={{background:"rgba(6,15,42,0.85)",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:10,letterSpacing:"0.22em",color:"rgba(100,150,220,0.45)",fontFamily:"'Space Mono',monospace",marginBottom:16}}>SAFETY ADVISORY</div>
                  <div style={{fontSize:14,lineHeight:1.75,color:"rgba(210,228,255,0.88)",background:`linear-gradient(135deg,${riskColor}0d,${riskColor}06)`,border:`1px solid ${riskColor}25`,borderRadius:14,padding:"16px 18px",position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:`linear-gradient(180deg,${riskColor},${riskColor}44)`,borderRadius:"3px 0 0 3px"}}/>
                    <div style={{paddingLeft:8}}>{result.advisory}</div>
                  </div>
                </div>
                <div style={{marginTop:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:11,fontFamily:"'Space Mono',monospace",color:"rgba(120,160,220,0.5)"}}>
                    <span>DATA CONFIDENCE</span>
                    <span style={{color:result.confidence>75?"#34d399":"#fbbf24",fontWeight:700}}>{result.confidence}%</span>
                  </div>
                  <div style={{height:6,background:"rgba(255,255,255,0.05)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{width:`${result.confidence}%`,height:"100%",background:result.confidence>75?"linear-gradient(90deg,#34d399,#10b981)":"linear-gradient(90deg,#fbbf24,#f59e0b)",borderRadius:3,transition:"width 1.2s ease"}}/>
                  </div>
                  <div style={{marginTop:12,fontSize:10,color:"rgba(100,130,190,0.35)",fontFamily:"'Space Mono',monospace",lineHeight:1.7}}>
                    {result.data_sources.join("  ·  ")}
                  </div>
                </div>
              </div>
            </div>

            <div style={{marginTop:28,textAlign:"center",fontSize:10,color:"rgba(80,110,170,0.25)",fontFamily:"'Space Mono',monospace",letterSpacing:"0.1em",lineHeight:2}}>
              FOR INFORMATIONAL USE ONLY  ·  ALWAYS VERIFY WITH OFFICIAL NOAA, NWS & USCG ADVISORIES BEFORE DEPARTURE
            </div>
          </div>
        )}
      </div>
    </>
  );
}