import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const irishGolfCourses = [
  // LEINSTER - DUBLIN
  { name: 'Royal Dublin Golf Club', location: 'Bull Island, Co. Dublin', par: 72 },
  { name: 'Portmarnock Golf Club', location: 'Portmarnock, Co. Dublin', par: 72 },
  { name: 'The Island Golf Club', location: 'Donabate, Co. Dublin', par: 71 },
  { name: 'Portmarnock Hotel & Golf Links', location: 'Portmarnock, Co. Dublin', par: 71 },
  { name: 'Castle Golf Club', location: 'Rathfarnham, Co. Dublin', par: 70 },
  { name: 'Elm Park Golf Club', location: 'Donnybrook, Co. Dublin', par: 69 },
  { name: 'Milltown Golf Club', location: 'Milltown, Co. Dublin', par: 71 },
  { name: 'Hermitage Golf Club', location: 'Lucan, Co. Dublin', par: 71 },
  { name: 'Stackstown Golf Club', location: 'Rathfarnham, Co. Dublin', par: 72 },
  { name: 'Deer Park Hotel & Golf Courses', location: 'Howth, Co. Dublin', par: 72 },
  { name: 'Howth Golf Club', location: 'Howth, Co. Dublin', par: 71 },
  { name: 'St. Anne\'s Golf Club', location: 'Bull Island, Co. Dublin', par: 70 },
  { name: 'Clontarf Golf Club', location: 'Clontarf, Co. Dublin', par: 69 },
  { name: 'Malahide Golf Club', location: 'Malahide, Co. Dublin', par: 71 },
  { name: 'Forrest Little Golf Club', location: 'Cloghran, Co. Dublin', par: 70 },
  { name: 'Swords Golf Club', location: 'Swords, Co. Dublin', par: 70 },
  { name: 'Corballis Public Golf Course', location: 'Donabate, Co. Dublin', par: 72 },
  { name: 'Donabate Golf Club', location: 'Donabate, Co. Dublin', par: 72 },
  { name: 'Skerries Golf Club', location: 'Skerries, Co. Dublin', par: 73 },
  { name: 'Rush Golf Club', location: 'Rush, Co. Dublin', par: 70 },
  { name: 'Balbriggan Golf Club', location: 'Balbriggan, Co. Dublin', par: 71 },
  { name: 'Turvey Golf Club', location: 'Donabate, Co. Dublin', par: 72 },
  { name: 'Hollywood Lakes Golf Club', location: 'Ballyboughal, Co. Dublin', par: 72 },
  { name: 'Hollystown Golf Club', location: 'Hollystown, Co. Dublin', par: 72 },
  { name: 'Luttrellstown Castle Golf Club', location: 'Castleknock, Co. Dublin', par: 72 },
  { name: 'Westmanstown Golf Club', location: 'Clonsilla, Co. Dublin', par: 72 },
  { name: 'Balcarrick Golf Club', location: 'Donabate, Co. Dublin', par: 73 },
  { name: 'Newlands Golf Club', location: 'Clondalkin, Co. Dublin', par: 71 },
  { name: 'Citywest Golf Club', location: 'Saggart, Co. Dublin', par: 72 },
  { name: 'Beech Park Golf Club', location: 'Rathcoole, Co. Dublin', par: 71 },
  { name: 'Edmondstown Golf Club', location: 'Rathfarnham, Co. Dublin', par: 71 },
  { name: 'Grange Golf Club', location: 'Rathfarnham, Co. Dublin', par: 71 },
  { name: 'Woodbrook Golf Club', location: 'Bray, Co. Dublin', par: 72 },
  { name: 'Dun Laoghaire Golf Club', location: 'Dun Laoghaire, Co. Dublin', par: 71 },
  { name: 'Killiney Golf Club', location: 'Killiney, Co. Dublin', par: 68 },
  { name: 'Foxrock Golf Club', location: 'Foxrock, Co. Dublin', par: 70 },
  { name: 'Leopardstown Golf Club', location: 'Leopardstown, Co. Dublin', par: 71 },
  { name: 'Stepaside Golf Club', location: 'Stepaside, Co. Dublin', par: 70 },
  { name: 'Carrickmines Golf Club', location: 'Carrickmines, Co. Dublin', par: 70 },
  { name: 'Old Conna Golf Club', location: 'Bray, Co. Dublin', par: 72 },
  { name: 'Slade Valley Golf Club', location: 'Brittas, Co. Dublin', par: 72 },
  { name: 'Ballinascorney Golf Club', location: 'Tallaght, Co. Dublin', par: 71 },
  { name: 'Rathfarnham Golf Club', location: 'Rathfarnham, Co. Dublin', par: 70 },
  { name: 'Spawell Golf Club', location: 'Templeogue, Co. Dublin', par: 70 },

  // LEINSTER - WICKLOW
  { name: 'European Club', location: 'Brittas Bay, Co. Wicklow', par: 71 },
  { name: 'Druids Glen Golf Resort', location: 'Newtownmountkennedy, Co. Wicklow', par: 71 },
  { name: 'Powerscourt Golf Club', location: 'Enniskerry, Co. Wicklow', par: 72 },
  { name: 'Druids Heath Golf Club', location: 'Newtownmountkennedy, Co. Wicklow', par: 71 },
  { name: 'Blainroe Golf Club', location: 'Blainroe, Co. Wicklow', par: 72 },
  { name: 'Arklow Golf Club', location: 'Arklow, Co. Wicklow', par: 68 },
  { name: 'Wicklow Golf Club', location: 'Wicklow Town, Co. Wicklow', par: 71 },
  { name: 'Greystones Golf Club', location: 'Greystones, Co. Wicklow', par: 69 },
  { name: 'Delgany Golf Club', location: 'Delgany, Co. Wicklow', par: 69 },
  { name: 'Bray Golf Club', location: 'Bray, Co. Wicklow', par: 72 },
  { name: 'Glen of the Downs Golf Club', location: 'Delgany, Co. Wicklow', par: 71 },
  { name: 'Coollattin Golf Club', location: 'Shillelagh, Co. Wicklow', par: 72 },
  { name: 'Woodenbridge Golf Club', location: 'Arklow, Co. Wicklow', par: 71 },
  { name: 'Baltinglass Golf Club', location: 'Baltinglass, Co. Wicklow', par: 70 },
  { name: 'Roundwood Golf Club', location: 'Roundwood, Co. Wicklow', par: 72 },
  { name: 'Charlesland Golf Club', location: 'Greystones, Co. Wicklow', par: 72 },
  { name: 'Rathsallagh Golf Club', location: 'Dunlavin, Co. Wicklow', par: 72 },

  // LEINSTER - KILDARE
  { name: 'The K Club (Palmer)', location: 'Straffan, Co. Kildare', par: 72 },
  { name: 'The K Club (Smurfit)', location: 'Straffan, Co. Kildare', par: 69 },
  { name: 'Carton House (Montgomerie)', location: 'Maynooth, Co. Kildare', par: 72 },
  { name: 'Carton House (O\'Meara)', location: 'Maynooth, Co. Kildare', par: 71 },
  { name: 'Kilkea Castle Golf Club', location: 'Castledermot, Co. Kildare', par: 70 },
  { name: 'Knockanally Golf Club', location: 'Donadea, Co. Kildare', par: 72 },
  { name: 'Highfield Golf Club', location: 'Carbury, Co. Kildare', par: 71 },
  { name: 'Bodenstown Golf Club', location: 'Sallins, Co. Kildare', par: 71 },
  { name: 'Naas Golf Club', location: 'Naas, Co. Kildare', par: 71 },
  { name: 'Craddockstown Golf Club', location: 'Naas, Co. Kildare', par: 72 },
  { name: 'Kilcock Golf Club', location: 'Kilcock, Co. Kildare', par: 70 },
  { name: 'Curragh Golf Club', location: 'The Curragh, Co. Kildare', par: 72 },
  { name: 'Athy Golf Club', location: 'Athy, Co. Kildare', par: 72 },
  { name: 'Castlewarden Golf Club', location: 'Straffan, Co. Kildare', par: 72 },
  { name: 'Celbridge Elm Hall Golf Club', location: 'Celbridge, Co. Kildare', par: 71 },
  { name: 'Cill Dara Golf Club', location: 'Kildare Town, Co. Kildare', par: 71 },
  { name: 'Clane Golf Club', location: 'Clane, Co. Kildare', par: 71 },
  { name: 'Palmerstown House Estate', location: 'Johnstown, Co. Kildare', par: 72 },
  { name: 'Headfort Golf Club (Old)', location: 'Kells, Co. Meath', par: 72 },

  // LEINSTER - MEATH
  { name: 'Laytown & Bettystown Golf Club', location: 'Bettystown, Co. Meath', par: 71 },
  { name: 'County Meath Golf Club', location: 'Trim, Co. Meath', par: 73 },
  { name: 'Royal Tara Golf Club', location: 'Navan, Co. Meath', par: 72 },
  { name: 'Ashbourne Golf Club', location: 'Ashbourne, Co. Meath', par: 71 },
  { name: 'Headfort Golf Club (New)', location: 'Kells, Co. Meath', par: 71 },
  { name: 'Black Bush Golf Club', location: 'Dunshaughlin, Co. Meath', par: 73 },
  { name: 'Ballinlough Golf Club', location: 'Athboy, Co. Meath', par: 70 },
  { name: 'Killeen Castle Golf Club', location: 'Dunsany, Co. Meath', par: 72 },
  { name: 'Navan Golf Club', location: 'Navan, Co. Meath', par: 71 },
  { name: 'Trim Golf Club', location: 'Trim, Co. Meath', par: 72 },
  { name: 'Ratoath Golf Club', location: 'Ratoath, Co. Meath', par: 71 },
  { name: 'Bellewstown Golf Club', location: 'Bellewstown, Co. Meath', par: 71 },
  { name: 'Gormanston Golf Club', location: 'Gormanston, Co. Meath', par: 70 },

  // LEINSTER - LOUTH
  { name: 'County Louth Golf Club (Baltray)', location: 'Baltray, Co. Louth', par: 73 },
  { name: 'Seapoint Golf Club', location: 'Termonfeckin, Co. Louth', par: 72 },
  { name: 'Dundalk Golf Club', location: 'Blackrock, Co. Louth', par: 72 },
  { name: 'Greenore Golf Club', location: 'Greenore, Co. Louth', par: 71 },
  { name: 'Ardee Golf Club', location: 'Ardee, Co. Louth', par: 72 },
  { name: 'Drogheda Golf Club', location: 'Drogheda, Co. Louth', par: 71 },
  { name: 'Killin Park Golf Club', location: 'Dundalk, Co. Louth', par: 71 },
  { name: 'Townley Hall Golf Club', location: 'Tullyallen, Co. Louth', par: 72 },
  { name: 'Headford Golf Club', location: 'Kells, Co. Meath', par: 72 },

  // LEINSTER - WESTMEATH
  { name: 'Glasson Golf Club', location: 'Athlone, Co. Westmeath', par: 72 },
  { name: 'Athlone Golf Club', location: 'Athlone, Co. Westmeath', par: 72 },
  { name: 'Mullingar Golf Club', location: 'Mullingar, Co. Westmeath', par: 72 },
  { name: 'Delvin Castle Golf Club', location: 'Delvin, Co. Westmeath', par: 71 },
  { name: 'Mount Temple Golf Club', location: 'Moate, Co. Westmeath', par: 72 },
  { name: 'Moate Golf Club', location: 'Moate, Co. Westmeath', par: 70 },

  // LEINSTER - OFFALY
  { name: 'Tullamore Golf Club', location: 'Tullamore, Co. Offaly', par: 71 },
  { name: 'Esker Hills Golf Club', location: 'Tullamore, Co. Offaly', par: 71 },
  { name: 'Birr Golf Club', location: 'Birr, Co. Offaly', par: 70 },
  { name: 'Edenderry Golf Club', location: 'Edenderry, Co. Offaly', par: 72 },
  { name: 'Castle Barna Golf Club', location: 'Daingean, Co. Offaly', par: 71 },

  // LEINSTER - LAOIS
  { name: 'The Heath Golf Club', location: 'Portlaoise, Co. Laois', par: 71 },
  { name: 'Portarlington Golf Club', location: 'Portarlington, Co. Laois', par: 71 },
  { name: 'Abbeyleix Golf Club', location: 'Abbeyleix, Co. Laois', par: 70 },
  { name: 'Mountrath Golf Club', location: 'Mountrath, Co. Laois', par: 71 },
  { name: 'Rathdowney Golf Club', location: 'Rathdowney, Co. Laois', par: 72 },

  // LEINSTER - KILKENNY
  { name: 'Mount Juliet Estate', location: 'Thomastown, Co. Kilkenny', par: 72 },
  { name: 'Kilkenny Golf Club', location: 'Glendine, Co. Kilkenny', par: 72 },
  { name: 'Callan Golf Club', location: 'Callan, Co. Kilkenny', par: 72 },
  { name: 'Castlecomer Golf Club', location: 'Castlecomer, Co. Kilkenny', par: 72 },
  { name: 'Mountain View Golf Club', location: 'Kilkenny, Co. Kilkenny', par: 71 },

  // LEINSTER - CARLOW
  { name: 'Carlow Golf Club', location: 'Carlow Town, Co. Carlow', par: 70 },
  { name: 'Borris Golf Club', location: 'Borris, Co. Carlow', par: 71 },

  // LEINSTER - WEXFORD
  { name: 'Rosslare Golf Club', location: 'Rosslare, Co. Wexford', par: 72 },
  { name: 'Enniscorthy Golf Club', location: 'Enniscorthy, Co. Wexford', par: 70 },
  { name: 'Courtown Golf Club', location: 'Courtown, Co. Wexford', par: 71 },
  { name: 'New Ross Golf Club', location: 'New Ross, Co. Wexford', par: 72 },
  { name: 'Wexford Golf Club', location: 'Mulgannon, Co. Wexford', par: 72 },
  { name: 'Seafield Golf Club', location: 'Gorey, Co. Wexford', par: 72 },
  { name: 'St. Helen\'s Bay Golf Club', location: 'Rosslare, Co. Wexford', par: 72 },

  // LEINSTER - LONGFORD
  { name: 'County Longford Golf Club', location: 'Longford Town, Co. Longford', par: 70 },

  // MUNSTER - KERRY
  { name: 'Ballybunion Golf Club (Old)', location: 'Ballybunion, Co. Kerry', par: 71 },
  { name: 'Ballybunion Golf Club (Cashen)', location: 'Ballybunion, Co. Kerry', par: 72 },
  { name: 'Waterville Golf Links', location: 'Waterville, Co. Kerry', par: 72 },
  { name: 'Tralee Golf Club', location: 'Tralee, Co. Kerry', par: 71 },
  { name: 'Dooks Golf Links', location: 'Glenbeigh, Co. Kerry', par: 70 },
  { name: 'Killarney Golf Club (Killeen)', location: 'Killarney, Co. Kerry', par: 73 },
  { name: 'Killarney Golf Club (Mahony\'s Point)', location: 'Killarney, Co. Kerry', par: 72 },
  { name: 'Killarney Golf Club (Lackabane)', location: 'Killarney, Co. Kerry', par: 72 },
  { name: 'Ceann Sibeal Golf Club', location: 'Ballyferriter, Co. Kerry', par: 72 },
  { name: 'Dingle Golf Club', location: 'Dingle, Co. Kerry', par: 72 },
  { name: 'Ring of Kerry Golf Club', location: 'Templenoe, Co. Kerry', par: 72 },
  { name: 'Kenmare Golf Club', location: 'Kenmare, Co. Kerry', par: 71 },
  { name: 'Ross Golf Club', location: 'Killarney, Co. Kerry', par: 70 },
  { name: 'Castleisland Golf Club', location: 'Castleisland, Co. Kerry', par: 70 },
  { name: 'Beaufort Golf Club', location: 'Beaufort, Co. Kerry', par: 72 },
  { name: 'Killorglin Golf Club', location: 'Killorglin, Co. Kerry', par: 70 },

  // MUNSTER - CORK
  { name: 'Old Head Golf Links', location: 'Kinsale, Co. Cork', par: 72 },
  { name: 'Cork Golf Club', location: 'Little Island, Co. Cork', par: 72 },
  { name: 'Fota Island Resort', location: 'Fota Island, Co. Cork', par: 71 },
  { name: 'Muskerry Golf Club', location: 'Carrigrohane, Co. Cork', par: 71 },
  { name: 'Douglas Golf Club', location: 'Douglas, Co. Cork', par: 71 },
  { name: 'Monkstown Golf Club', location: 'Monkstown, Co. Cork', par: 70 },
  { name: 'Harbour Point Golf Club', location: 'Little Island, Co. Cork', par: 72 },
  { name: 'Lee Valley Golf Club', location: 'Ovens, Co. Cork', par: 72 },
  { name: 'Mahon Golf Club', location: 'Blackrock, Co. Cork', par: 70 },
  { name: 'Bandon Golf Club', location: 'Bandon, Co. Cork', par: 71 },
  { name: 'Kinsale Golf Club', location: 'Kinsale, Co. Cork', par: 71 },
  { name: 'Macroom Golf Club', location: 'Macroom, Co. Cork', par: 72 },
  { name: 'Fermoy Golf Club', location: 'Fermoy, Co. Cork', par: 70 },
  { name: 'Mitchelstown Golf Club', location: 'Mitchelstown, Co. Cork', par: 71 },
  { name: 'Charleville Golf Club', location: 'Charleville, Co. Cork', par: 72 },
  { name: 'Mallow Golf Club', location: 'Mallow, Co. Cork', par: 72 },
  { name: 'Doneraile Golf Club', location: 'Doneraile, Co. Cork', par: 72 },
  { name: 'East Cork Golf Club', location: 'Midleton, Co. Cork', par: 72 },
  { name: 'Youghal Golf Club', location: 'Youghal, Co. Cork', par: 70 },
  { name: 'Cobh Golf Club', location: 'Cobh, Co. Cork', par: 69 },
  { name: 'Water Rock Golf Club', location: 'Midleton, Co. Cork', par: 72 },
  { name: 'Raffeen Creek Golf Club', location: 'Ringaskiddy, Co. Cork', par: 72 },
  { name: 'Cork City Golf Club', location: 'Ballinlough, Co. Cork', par: 69 },
  { name: 'Bishopstown Golf Club', location: 'Bishopstown, Co. Cork', par: 68 },
  { name: 'Skibbereen & West Cork Golf Club', location: 'Skibbereen, Co. Cork', par: 71 },
  { name: 'Bantry Bay Golf Club', location: 'Bantry, Co. Cork', par: 71 },
  { name: 'Berehaven Golf Club', location: 'Castletownbere, Co. Cork', par: 71 },

  // MUNSTER - LIMERICK
  { name: 'Adare Manor', location: 'Adare, Co. Limerick', par: 72 },
  { name: 'Limerick Golf Club', location: 'Ballyclough, Co. Limerick', par: 72 },
  { name: 'Limerick County Golf Club', location: 'Ballyneety, Co. Limerick', par: 72 },
  { name: 'Castletroy Golf Club', location: 'Castletroy, Co. Limerick', par: 71 },
  { name: 'Rathbane Golf Club', location: 'Rathbane, Co. Limerick', par: 72 },
  { name: 'Newcastle West Golf Club', location: 'Newcastle West, Co. Limerick', par: 72 },
  { name: 'Abbeyfeale Golf Club', location: 'Abbeyfeale, Co. Limerick', par: 70 },

  // MUNSTER - CLARE
  { name: 'Lahinch Golf Club', location: 'Lahinch, Co. Clare', par: 72 },
  { name: 'Doonbeg Golf Club', location: 'Doonbeg, Co. Clare', par: 72 },
  { name: 'Dromoland Castle', location: 'Newmarket-on-Fergus, Co. Clare', par: 71 },
  { name: 'Shannon Golf Club', location: 'Shannon, Co. Clare', par: 72 },
  { name: 'Ennis Golf Club', location: 'Ennis, Co. Clare', par: 72 },
  { name: 'Woodstock Golf Club', location: 'Ennis, Co. Clare', par: 72 },
  { name: 'East Clare Golf Club', location: 'Bodyke, Co. Clare', par: 70 },
  { name: 'Kilrush Golf Club', location: 'Kilrush, Co. Clare', par: 70 },
  { name: 'Spanish Point Golf Club', location: 'Spanish Point, Co. Clare', par: 66 },
  { name: 'Kilkee Golf Club', location: 'Kilkee, Co. Clare', par: 70 },

  // MUNSTER - WATERFORD
  { name: 'Tramore Golf Club', location: 'Tramore, Co. Waterford', par: 72 },
  { name: 'Dungarvan Golf Club', location: 'Dungarvan, Co. Waterford', par: 72 },
  { name: 'Waterford Golf Club', location: 'Newrath, Co. Waterford', par: 71 },
  { name: 'Waterford Castle Golf Club', location: 'The Island, Co. Waterford', par: 72 },
  { name: 'Faithlegg Golf Club', location: 'Faithlegg, Co. Waterford', par: 72 },
  { name: 'West Waterford Golf Club', location: 'Coolcormack, Co. Waterford', par: 72 },
  { name: 'Gold Coast Golf Club', location: 'Ballinacourty, Co. Waterford', par: 72 },

  // MUNSTER - TIPPERARY
  { name: 'Tipperary Golf Club', location: 'Rathanny, Co. Tipperary', par: 72 },
  { name: 'Thurles Golf Club', location: 'Thurles, Co. Tipperary', par: 72 },
  { name: 'Clonmel Golf Club', location: 'Clonmel, Co. Tipperary', par: 72 },
  { name: 'Nenagh Golf Club', location: 'Nenagh, Co. Tipperary', par: 70 },
  { name: 'Cahir Park Golf Club', location: 'Cahir, Co. Tipperary', par: 72 },
  { name: 'Roscrea Golf Club', location: 'Roscrea, Co. Tipperary', par: 72 },
  { name: 'Templemore Golf Club', location: 'Templemore, Co. Tipperary', par: 72 },
  { name: 'Ballykisteen Golf Club', location: 'Monard, Co. Tipperary', par: 72 },
  { name: 'County Tipperary Golf Club', location: 'Dundrum, Co. Tipperary', par: 71 },

  // CONNACHT - GALWAY
  { name: 'Connemara Golf Club', location: 'Clifden, Co. Galway', par: 72 },
  { name: 'Galway Bay Golf Resort', location: 'Oranmore, Co. Galway', par: 72 },
  { name: 'Galway Golf Club', location: 'Salthill, Co. Galway', par: 70 },
  { name: 'Bearna Golf Club', location: 'Bearna, Co. Galway', par: 72 },
  { name: 'Athenry Golf Club', location: 'Athenry, Co. Galway', par: 72 },
  { name: 'Tuam Golf Club', location: 'Tuam, Co. Galway', par: 71 },
  { name: 'Ballinasloe Golf Club', location: 'Ballinasloe, Co. Galway', par: 72 },
  { name: 'Portumna Golf Club', location: 'Portumna, Co. Galway', par: 72 },
  { name: 'Oughterard Golf Club', location: 'Oughterard, Co. Galway', par: 70 },
  { name: 'Gort Golf Club', location: 'Gort, Co. Galway', par: 72 },
  { name: 'Loughrea Golf Club', location: 'Loughrea, Co. Galway', par: 70 },

  // CONNACHT - MAYO
  { name: 'Westport Golf Club', location: 'Westport, Co. Mayo', par: 73 },
  { name: 'Carne Golf Links', location: 'Belmullet, Co. Mayo', par: 72 },
  { name: 'Ballina Golf Club', location: 'Ballina, Co. Mayo', par: 71 },
  { name: 'Castlebar Golf Club', location: 'Castlebar, Co. Mayo', par: 71 },
  { name: 'Achill Island Golf Club', location: 'Achill Island, Co. Mayo', par: 70 },
  { name: 'Claremorris Golf Club', location: 'Claremorris, Co. Mayo', par: 71 },
  { name: 'Mulranny Golf Club', location: 'Mulranny, Co. Mayo', par: 70 },
  { name: 'Swinford Golf Club', location: 'Swinford, Co. Mayo', par: 71 },
  { name: 'Ballinrobe Golf Club', location: 'Ballinrobe, Co. Mayo', par: 72 },

  // CONNACHT - SLIGO
  { name: 'County Sligo Golf Club (Rosses Point)', location: 'Rosses Point, Co. Sligo', par: 71 },
  { name: 'Enniscrone Golf Club', location: 'Enniscrone, Co. Sligo', par: 73 },
  { name: 'Strandhill Golf Club', location: 'Strandhill, Co. Sligo', par: 69 },
  { name: 'Sligo Golf Club', location: 'Rosses Point, Co. Sligo', par: 71 },

  // CONNACHT - ROSCOMMON
  { name: 'Roscommon Golf Club', location: 'Roscommon Town, Co. Roscommon', par: 72 },
  { name: 'Athlone Golf Club', location: 'Athlone, Co. Roscommon', par: 72 },
  { name: 'Ballaghaderreen Golf Club', location: 'Ballaghaderreen, Co. Roscommon', par: 70 },
  { name: 'Boyle Golf Club', location: 'Boyle, Co. Roscommon', par: 70 },
  { name: 'Strokestown Golf Club', location: 'Strokestown, Co. Roscommon', par: 70 },

  // CONNACHT - LEITRIM
  { name: 'Carrick-on-Shannon Golf Club', location: 'Carrick-on-Shannon, Co. Leitrim', par: 72 },
  { name: 'Ballinamore Golf Club', location: 'Ballinamore, Co. Leitrim', par: 70 },

  // ULSTER - DONEGAL
  { name: 'Donegal Golf Club (Murvagh)', location: 'Donegal Town, Co. Donegal', par: 73 },
  { name: 'Ballyliffin Golf Club (Glashedy)', location: 'Ballyliffin, Co. Donegal', par: 72 },
  { name: 'Ballyliffin Golf Club (Old)', location: 'Ballyliffin, Co. Donegal', par: 71 },
  { name: 'Rosapenna Golf Club (Sandy Hills)', location: 'Downings, Co. Donegal', par: 71 },
  { name: 'Rosapenna Golf Club (Old Tom Morris)', location: 'Downings, Co. Donegal', par: 71 },
  { name: 'Portsalon Golf Club', location: 'Portsalon, Co. Donegal', par: 69 },
  { name: 'North West Golf Club', location: 'Buncrana, Co. Donegal', par: 70 },
  { name: 'Narin & Portnoo Golf Club', location: 'Narin, Co. Donegal', par: 73 },
  { name: 'Bundoran Golf Club', location: 'Bundoran, Co. Donegal', par: 70 },
  { name: 'Letterkenny Golf Club', location: 'Letterkenny, Co. Donegal', par: 72 },
  { name: 'Dunfanaghy Golf Club', location: 'Dunfanaghy, Co. Donegal', par: 68 },
  { name: 'Ballybofey & Stranorlar Golf Club', location: 'Ballybofey, Co. Donegal', par: 70 },
  { name: 'Gweedore Golf Club', location: 'Gweedore, Co. Donegal', par: 68 },
  { name: 'Cruit Island Golf Club', location: 'Kincasslagh, Co. Donegal', par: 70 },

  // ULSTER - CAVAN
  { name: 'County Cavan Golf Club', location: 'Drumelis, Co. Cavan', par: 72 },
  { name: 'Slieve Russell Golf Club', location: 'Ballyconnell, Co. Cavan', par: 72 },
  { name: 'Cabra Castle Golf Club', location: 'Kingscourt, Co. Cavan', par: 72 },
  { name: 'Virginia Golf Club', location: 'Virginia, Co. Cavan', par: 70 },
  { name: 'Belturbet Golf Club', location: 'Belturbet, Co. Cavan', par: 70 },

  // ULSTER - MONAGHAN
  { name: 'Rossmore Golf Club', location: 'Monaghan Town, Co. Monaghan', par: 71 },
  { name: 'Nuremore Golf Club', location: 'Carrickmacross, Co. Monaghan', par: 71 },
  { name: 'Castleblayney Golf Club', location: 'Castleblayney, Co. Monaghan', par: 72 },
  { name: 'Clones Golf Club', location: 'Clones, Co. Monaghan', par: 70 },

  // NORTHERN IRELAND - DOWN
  { name: 'Royal County Down', location: 'Newcastle, Co. Down', par: 71 },
  { name: 'Ardglass Golf Club', location: 'Ardglass, Co. Down', par: 70 },
  { name: 'Royal Belfast Golf Club', location: 'Craigavad, Co. Down', par: 70 },
  { name: 'Kirkistown Castle Golf Club', location: 'Cloughey, Co. Down', par: 69 },
  { name: 'Bangor Golf Club', location: 'Bangor, Co. Down', par: 71 },
  { name: 'Holywood Golf Club', location: 'Holywood, Co. Down', par: 69 },
  { name: 'Warrenpoint Golf Club', location: 'Warrenpoint, Co. Down', par: 71 },
  { name: 'Kilkeel Golf Club', location: 'Kilkeel, Co. Down', par: 71 },
  { name: 'Spa Golf Club', location: 'Ballynahinch, Co. Down', par: 72 },
  { name: 'Donaghadee Golf Club', location: 'Donaghadee, Co. Down', par: 71 },
  { name: 'Clandeboye Golf Club', location: 'Conlig, Co. Down', par: 71 },
  { name: 'Downpatrick Golf Club', location: 'Downpatrick, Co. Down', par: 69 },
  { name: 'Mahee Island Golf Club', location: 'Comber, Co. Down', par: 70 },

  // NORTHERN IRELAND - ANTRIM
  { name: 'Royal Portrush (Dunluce)', location: 'Portrush, Co. Antrim', par: 72 },
  { name: 'Royal Portrush (Valley)', location: 'Portrush, Co. Antrim', par: 70 },
  { name: 'Ballycastle Golf Club', location: 'Ballycastle, Co. Antrim', par: 71 },
  { name: 'Cairndhu Golf Club', location: 'Ballygally, Co. Antrim', par: 70 },
  { name: 'Galgorm Castle Golf Club', location: 'Ballymena, Co. Antrim', par: 72 },
  { name: 'Ballymena Golf Club', location: 'Ballymena, Co. Antrim', par: 70 },
  { name: 'Larne Golf Club', location: 'Larne, Co. Antrim', par: 70 },
  { name: 'Carrickfergus Golf Club', location: 'Carrickfergus, Co. Antrim', par: 68 },
  { name: 'Whitehead Golf Club', location: 'Whitehead, Co. Antrim', par: 72 },
  { name: 'Cushendall Golf Club', location: 'Cushendall, Co. Antrim', par: 68 },
  { name: 'Massereene Golf Club', location: 'Antrim, Co. Antrim', par: 72 },
  { name: 'Allen Park Golf Club', location: 'Antrim, Co. Antrim', par: 71 },

  // NORTHERN IRELAND - DERRY/LONDONDERRY
  { name: 'Portstewart Golf Club (Strand)', location: 'Portstewart, Co. Derry', par: 72 },
  { name: 'Castlerock Golf Club', location: 'Castlerock, Co. Derry', par: 73 },
  { name: 'City of Derry Golf Club', location: 'Prehen, Co. Derry', par: 71 },
  { name: 'Foyle Golf Club', location: 'Derry, Co. Derry', par: 71 },
  { name: 'Moyola Park Golf Club', location: 'Castledawson, Co. Derry', par: 71 },
  { name: 'Kilrea Golf Club', location: 'Kilrea, Co. Derry', par: 70 },

  // NORTHERN IRELAND - ARMAGH
  { name: 'County Armagh Golf Club', location: 'Armagh, Co. Armagh', par: 70 },
  { name: 'Tandragee Golf Club', location: 'Tandragee, Co. Armagh', par: 71 },
  { name: 'Portadown Golf Club', location: 'Portadown, Co. Armagh', par: 70 },
  { name: 'Lurgan Golf Club', location: 'Lurgan, Co. Armagh', par: 72 },
  { name: 'Craigavon Golf Club', location: 'Craigavon, Co. Armagh', par: 72 },

  // NORTHERN IRELAND - TYRONE
  { name: 'Dungannon Golf Club', location: 'Dungannon, Co. Tyrone', par: 71 },
  { name: 'Omagh Golf Club', location: 'Omagh, Co. Tyrone', par: 71 },
  { name: 'Strabane Golf Club', location: 'Strabane, Co. Tyrone', par: 69 },
  { name: 'Newtownstewart Golf Club', location: 'Newtownstewart, Co. Tyrone', par: 69 },
  { name: 'Fintona Golf Club', location: 'Fintona, Co. Tyrone', par: 70 },

  // NORTHERN IRELAND - FERMANAGH
  { name: 'Enniskillen Golf Club', location: 'Enniskillen, Co. Fermanagh', par: 71 },
  { name: 'Castle Hume Golf Club', location: 'Enniskillen, Co. Fermanagh', par: 72 },
  { name: 'Lough Erne Golf Resort', location: 'Enniskillen, Co. Fermanagh', par: 71 },
];

async function main() {
  console.log('Starting seed...');

  // Get existing course names to avoid duplicates
  const existingCourses = await prisma.course.findMany({
    select: { name: true },
  });
  const existingNames = new Set(existingCourses.map(c => c.name));
  console.log(`Found ${existingNames.size} existing courses.`);

  // Insert only new golf courses
  let count = 0;
  let skipped = 0;
  for (const course of irishGolfCourses) {
    if (existingNames.has(course.name)) {
      skipped++;
      continue;
    }
    await prisma.course.create({
      data: course,
    });
    count++;
    if (count % 50 === 0) {
      console.log(`Added ${count} courses...`);
    }
  }

  console.log(`Successfully added ${count} new Irish golf courses!`);
  console.log(`Skipped ${skipped} courses that already exist.`);
  console.log(`Total courses in database: ${existingNames.size + count}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
