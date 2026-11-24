/**
 * CivicPulse - Neighborhood Residents Reporting Platform
 * Local Database Store & Seed Data (Indian Urban Civic Context)
 * Schema models: Users, Issues, IssueMedia, Comments, Notifications, HelpDeskTickets, Departments, Wards
 */

const STORAGE_KEY = "nagrikseva_db_v4";

// Major Indian Cities Coordinates Lookup (Pan-India Freedom)
const INDIAN_CITY_COORDS = {
  "delhi": { lat: 28.6139, lng: 77.2090 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  "bengaluru": { lat: 12.9716, lng: 77.5946 },
  "bangalore": { lat: 12.9716, lng: 77.5946 },
  "mumbai": { lat: 19.0760, lng: 72.8777 },
  "kolkata": { lat: 22.5726, lng: 88.3639 },
  "hyderabad": { lat: 17.3850, lng: 78.4867 },
  "chennai": { lat: 13.0827, lng: 80.2707 },
  "pune": { lat: 18.5204, lng: 73.8567 },
  "ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "jaipur": { lat: 26.9124, lng: 75.7873 },
  "lucknow": { lat: 26.8467, lng: 80.9462 },
  "kanpur": { lat: 26.4499, lng: 80.3319 },
  "nagpur": { lat: 21.1458, lng: 79.0882 },
  "indore": { lat: 22.7196, lng: 75.8577 },
  "bhopal": { lat: 23.2599, lng: 77.4126 },
  "patna": { lat: 25.5941, lng: 85.1376 },
  "vadodara": { lat: 22.3072, lng: 73.1812 },
  "ghaziabad": { lat: 28.6692, lng: 77.4538 },
  "ludhiana": { lat: 30.9010, lng: 75.8573 },
  "agra": { lat: 27.1767, lng: 78.0081 },
  "nashik": { lat: 19.9975, lng: 73.7898 },
  "varanasi": { lat: 25.3176, lng: 82.9739 },
  "srinagar": { lat: 34.0837, lng: 74.7973 },
  "amritsar": { lat: 31.6340, lng: 74.8723 },
  "chandigarh": { lat: 30.7333, lng: 76.7794 },
  "kochi": { lat: 9.9312, lng: 76.2673 },
  "coimbatore": { lat: 11.0168, lng: 76.9558 },
  "surat": { lat: 21.1702, lng: 72.8311 },
  "visakhapatnam": { lat: 17.6868, lng: 83.2185 },
  "dehradun": { lat: 30.3165, lng: 78.0322 },
  "ranchi": { lat: 23.3441, lng: 85.3096 },
  "guwahati": { lat: 26.1445, lng: 91.7362 },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245 },
  "raipur": { lat: 21.2514, lng: 81.6296 },
  "shimla": { lat: 31.1048, lng: 77.1734 },
  "mysuru": { lat: 12.2958, lng: 76.6394 },
  "thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
  "noida": { lat: 28.5355, lng: 77.3910 },
  "gurugram": { lat: 28.4595, lng: 77.0266 },
  "faridabad": { lat: 28.4089, lng: 77.3178 }
};

function getCoordsForCity(cityName) {
  if (!cityName) return { lat: 20.5937, lng: 78.9629 };
  const key = cityName.toLowerCase().trim();
  for (const [k, coords] of Object.entries(INDIAN_CITY_COORDS)) {
    if (key.includes(k) || k.includes(key)) {
      return coords;
    }
  }
  return { lat: 20.5937, lng: 78.9629 };
}

// Seed Initial Data (Indian Municipal Governance)
const SEED_DATA = {
  wards: [
    // Bengaluru
    {
      id: "ward-1",
      name: "Ward 112 - Indiranagar Central",
      zone: "East Zone",
      city: "Bengaluru",
      lat: 12.9784,
      lng: 77.6408,
    },
    {
      id: "ward-2",
      name: "Ward 80 - Koramangala & HSR Link",
      zone: "South Zone",
      city: "Bengaluru",
      lat: 12.9352,
      lng: 77.6245,
    },
    {
      id: "ward-3",
      name: "Ward 150 - Bellandur & Outer Ring Road",
      zone: "Mahadevapura",
      city: "Bengaluru",
      lat: 12.9304,
      lng: 77.6784,
    },
    {
      id: "ward-4",
      name: "Ward 74 - Malleshwaram",
      zone: "West Zone",
      city: "Bengaluru",
      lat: 13.0031,
      lng: 77.5643,
    },
    // New Delhi
    {
      id: "ward-5",
      name: "Ward 24 - Connaught Place & Central",
      zone: "Central Zone",
      city: "New Delhi",
      lat: 28.6304,
      lng: 77.2177,
    },
    {
      id: "ward-6",
      name: "Ward 42 - South Extension & Lajpat",
      zone: "South Zone",
      city: "New Delhi",
      lat: 28.5684,
      lng: 77.2215,
    },
    // Mumbai
    {
      id: "ward-7",
      name: "Ward H/West - Bandra West & Khar",
      zone: "Western Suburbs",
      city: "Mumbai",
      lat: 19.0596,
      lng: 72.8295,
    },
    {
      id: "ward-8",
      name: "Ward A - Marine Drive & Colaba",
      zone: "South Mumbai",
      city: "Mumbai",
      lat: 18.922,
      lng: 72.8347,
    },
    // Kolkata
    {
      id: "ward-9",
      name: "Ward 63 - Park Street & Camac St",
      zone: "Central Zone",
      city: "Kolkata",
      lat: 22.5512,
      lng: 88.3533,
    },
    {
      id: "ward-10",
      name: "Ward 31 - Salt Lake Sector V",
      zone: "Bidhannagar",
      city: "Kolkata",
      lat: 22.5804,
      lng: 88.4378,
    },
    // Hyderabad
    {
      id: "ward-11",
      name: "Ward 98 - HITEC City & Madhapur",
      zone: "Cyberabad",
      city: "Hyderabad",
      lat: 17.4474,
      lng: 78.3762,
    },
    {
      id: "ward-12",
      name: "Ward 70 - Banjara Hills & Jubilee",
      zone: "Khairatabad",
      city: "Hyderabad",
      lat: 17.4156,
      lng: 78.435,
    },
    // Chennai
    {
      id: "ward-13",
      name: "Ward 118 - T. Nagar & Panagal Park",
      zone: "Teynampet",
      city: "Chennai",
      lat: 13.0418,
      lng: 80.2341,
    },
    // Pune
    {
      id: "ward-14",
      name: "Ward 12 - Shivajinagar & FC Road",
      zone: "Central Zone",
      city: "Pune",
      lat: 18.5314,
      lng: 73.8446,
    },
    // Lucknow
    {
      id: "ward-lucknow-hazratganj",
      name: "Hazratganj Central",
      zone: "Central Zone",
      city: "Lucknow",
      lat: 26.8488,
      lng: 80.9452,
    },
    // Jaipur
    {
      id: "ward-jaipur-malviya",
      name: "Malviya Nagar",
      zone: "South Zone",
      city: "Jaipur",
      lat: 26.8532,
      lng: 75.8156,
    },
  ],

  departments: [
    {
      id: "dept-pw",
      name: "Public Works Dept (PWD)",
      code: "PWD",
      head: "Er. Rajesh Verma",
      slaHours: 48,
      email: "pwd.ward112@muni.gov.in",
      icon: "wrench",
    },
    {
      id: "dept-elec",
      name: "Electricity Board (BESCOM)",
      code: "BESCOM",
      head: "Er. Vikram Singh",
      slaHours: 24,
      email: "bescom.complaints@karnataka.gov.in",
      icon: "zap",
    },
    {
      id: "dept-san",
      name: "Solid Waste Mgmt (SWM)",
      code: "SWM",
      head: "Smt. Manju Gowda",
      slaHours: 36,
      email: "swm.clean@muni.gov.in",
      icon: "trash-2",
    },
    {
      id: "dept-water",
      name: "Jal Board (BWSSB)",
      code: "BWSSB",
      head: "Er. Ramesh Kulkarni",
      slaHours: 12,
      email: "waterdesk.ward112@bwssb.gov.in",
      icon: "droplet",
    },
    {
      id: "dept-admin",
      name: "Horticulture & Parks Vibhag",
      code: "HORT",
      head: "Dr. Sunita Murthy",
      slaHours: 72,
      email: "parks.civic@muni.gov.in",
      icon: "tree-pine",
    },
  ],

  users: [
    {
      id: "usr-res-1",
      name: "Aarav Sharma",
      email: "aarav.resident@nagrikseva.in",
      phone: "+91 98450 12345",
      password_hash: "argon2id$mock_hash_aarav",
      role: "resident",
      ward_id: "ward-1",
      department_id: null,
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      address: "Flat 402, Shanti Nilaya, 12th Main, Indiranagar, Ward 112",
    },
    {
      id: "usr-field-1",
      name: "Rajesh Verma",
      email: "rajesh.verma@muni.gov.in",
      phone: "+91 94480 34567",
      password_hash: "argon2id$mock_hash_rajesh",
      role: "field_team",
      ward_id: "ward-1",
      department_id: "dept-pw",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      title: "Assistant Executive Engineer - PWD",
    },
    {
      id: "usr-field-2",
      name: "Vikram Singh",
      email: "vikram.singh@bescom.gov.in",
      phone: "+91 94480 98765",
      password_hash: "argon2id$mock_hash_vikram",
      role: "field_team",
      ward_id: "ward-2",
      department_id: "dept-elec",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      title: "Junior Line Inspector - BESCOM",
    },
    {
      id: "usr-help-1",
      name: "Priya Patel",
      email: "priya.helpdesk@nagrikseva.in",
      phone: "+91 98200 45678",
      password_hash: "argon2id$mock_hash_priya",
      role: "help_desk",
      ward_id: "ward-1",
      department_id: "dept-admin",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      title: "Citizen Assistance Officer",
    },
    {
      id: "usr-admin-1",
      name: "Dr. Anand Deshmukh, IAS",
      email: "commissioner@muni.gov.in",
      phone: "+91 80 2222 1111",
      password_hash: "argon2id$mock_hash_deshmukh",
      role: "admin",
      ward_id: "ward-1",
      department_id: null,
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      title: "Municipal Commissioner",
    },
  ],

  issues: [
    {
      id: "ISS-2026-081",
      reporter_id: "usr-res-1",
      category: "Pothole",
      title:
        "Deep crater pothole near Indiranagar 100 Feet Road Metro Pillar 42",
      description:
        "Severe 8-inch asphalt pothole opened up after monsoon downpour near the metro pillar bicycle lane. Two two-wheeler riders skidded and sustained injuries yesterday.",
      latitude: 12.9785,
      longitude: 77.6409,
      address: "100 Feet Road, Near Metro Pillar 42, Indiranagar, Ward 112",
      ward_id: "ward-1",
      priority: "high",
      status: "in_progress",
      assigned_department: "dept-pw",
      assigned_to_id: "usr-field-1",
      upvotes_count: 19,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          note: "Reported by resident Aarav Sharma",
        },
        {
          status: "assigned",
          timestamp: new Date(Date.now() - 32 * 3600 * 1000).toISOString(),
          note: "Auto-routed to PWD Division 4 (Assignee: Er. Rajesh Verma)",
        },
        {
          status: "in_progress",
          timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
          note: "Road repair gang dispatched with cold-mix bitumen batch",
        },
      ],
    },
    {
      id: "ISS-2026-082",
      reporter_id: "usr-res-1",
      category: "Streetlight",
      title:
        "Dark crossroad: 4 streetlights not working on 12th Main Koramangala",
      description:
        "Four consecutive high-pressure sodium street lamps have been completely out for 3 days. Stretch is pitch dark, causing serious safety hazards for pedestrians walking from the bus stop.",
      latitude: 12.9355,
      longitude: 77.6248,
      address: "Cross 5, 12th Main Road, 4th Block, Koramangala, Ward 80",
      ward_id: "ward-2",
      priority: "critical",
      status: "assigned",
      assigned_department: "dept-elec",
      assigned_to_id: "usr-field-2",
      upvotes_count: 34,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 58 * 3600 * 1000).toISOString(), // SLA breach (> 48hrs)
      updated_at: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 58 * 3600 * 1000).toISOString(),
          note: "Reported as Immediate Safety Hazard",
        },
        {
          status: "assigned",
          timestamp: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
          note: "Auto-routed to BESCOM Sub-Division (Assignee: Vikram Singh)",
        },
      ],
    },
    {
      id: "ISS-2026-083",
      reporter_id: "usr-res-1",
      category: "Waste",
      title: "Garbage blackspot & overflowing dumper bin on CMH Road",
      description:
        "Morning waste compactor missed round. Open garbage bags ripped open by stray animals blocking the footpath and choking the storm drain.",
      latitude: 12.978,
      longitude: 77.6415,
      address: "Near Metro Station, CMH Road, Indiranagar, Ward 112",
      ward_id: "ward-1",
      priority: "medium",
      status: "resolved",
      assigned_department: "dept-san",
      assigned_to_id: "usr-field-1",
      upvotes_count: 12,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
          note: "Reported by Aarav Sharma",
        },
        {
          status: "assigned",
          timestamp: new Date(Date.now() - 68 * 3600 * 1000).toISOString(),
          note: "Routed to SWM Swachhta Rapid Action Team",
        },
        {
          status: "in_progress",
          timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
          note: "Compactor vehicle KA-04-E-202 on site",
        },
        {
          status: "resolved",
          timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
          note: "Garbage cleared, bleaching powder spread and pavement sanitized",
        },
      ],
    },
    {
      id: "ISS-2026-084",
      reporter_id: "usr-res-1",
      category: "Water",
      title:
        "High-pressure potable water pipeline burst gushing onto Outer Ring Road",
      description:
        "BWSSB water pipeline flange cracked. Clean potable drinking water is overflowing onto the service lane and flooding into apartment basement parking.",
      latitude: 12.9308,
      longitude: 77.6788,
      address: "Service Lane near EcoSpace, Bellandur, Ward 150",
      ward_id: "ward-3",
      priority: "critical",
      status: "submitted",
      assigned_department: "dept-water",
      assigned_to_id: null,
      upvotes_count: 42,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          note: "Urgent drinking water pipeline breach reported",
        },
      ],
    },
    {
      id: "ISS-2026-085",
      reporter_id: "usr-res-1",
      category: "Other",
      title: "Storm-damaged Gulmohar tree branch wedged over 11kV cables",
      description:
        "Heavy gusty winds snapped large tree branch in Malleshwaram park. It is hanging directly on high-voltage power lines above the children play area.",
      latitude: 13.0035,
      longitude: 77.5647,
      address: "15th Cross, Margosa Road, Malleshwaram, Ward 74",
      ward_id: "ward-4",
      priority: "high",
      status: "assigned",
      assigned_department: "dept-admin",
      assigned_to_id: "usr-field-1",
      upvotes_count: 23,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 60 * 3600 * 1000).toISOString(), // SLA breach (> 48hrs)
      updated_at: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
          note: "Tree hazard reported",
        },
        {
          status: "assigned",
          timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
          note: "Routed to Horticulture & Forestry wing",
        },
      ],
    },
    {
      id: "ISS-2026-086",
      reporter_id: "usr-res-1",
      category: "Pothole",
      title: "Sunken telecom utility trench near pedestrian crosswalk",
      description:
        "OFC cable trench dug last week has subsided 4 inches, causing severe jolts to auto-rickshaws and two-wheelers.",
      latitude: 12.9788,
      longitude: 77.6412,
      address: "100 Feet Road, Near CMH Signal, Indiranagar, Ward 112",
      ward_id: "ward-1",
      priority: "medium",
      status: "submitted",
      assigned_department: "dept-pw",
      assigned_to_id: null,
      upvotes_count: 7,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          note: "Issue submitted",
        },
      ],
    },
    // New Delhi Issues
    {
      id: "ISS-2026-091",
      reporter_id: "usr-res-1",
      category: "Pothole",
      title:
        "Major tarmac crater on Outer Circle near Regal Cinema, Connaught Place",
      description:
        "Severe pothole developed after heavy monsoon showers near Regal building junction. Causing severe traffic bottlenecks and bike accidents during peak hours.",
      latitude: 28.6315,
      longitude: 77.2167,
      address: "Outer Circle, Near Regal Cinema, Connaught Place, New Delhi",
      ward_id: "ward-5",
      priority: "critical",
      status: "in_progress",
      assigned_department: "dept-pw",
      assigned_to_id: "usr-field-1",
      upvotes_count: 28,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          note: "Reported by local commuter",
        },
        {
          status: "in_progress",
          timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          note: "NDMC road repair crew deployed",
        },
      ],
    },
    {
      id: "ISS-2026-092",
      reporter_id: "usr-res-1",
      category: "Streetlight",
      title: "Non-functional street light cluster on Ring Road flyover descent",
      description:
        "Consecutive LED street lights have been dark for 48 hours creating a hazardous black spot for merging vehicles.",
      latitude: 28.5684,
      longitude: 77.2215,
      address: "Ring Road Flyover Descent, South Extension Part 2, New Delhi",
      ward_id: "ward-6",
      priority: "high",
      status: "submitted",
      assigned_department: "dept-elec",
      assigned_to_id: null,
      upvotes_count: 15,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
          note: "Submitted via citizen portal",
        },
      ],
    },
    // Mumbai Issues
    {
      id: "ISS-2026-093",
      reporter_id: "usr-res-1",
      category: "Waste",
      title: "Overflowing commercial waste and plastic refuse on Linking Road",
      description:
        "Garbage bins overflowing onto shopping sidewalk near Khar junction. Pedestrians forced onto main carriageway.",
      latitude: 19.062,
      longitude: 72.8315,
      address: "Opposite KFC, Linking Road, Bandra West, Mumbai",
      ward_id: "ward-7",
      priority: "medium",
      status: "assigned",
      assigned_department: "dept-san",
      assigned_to_id: "usr-field-1",
      upvotes_count: 22,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
          note: "Reported by local resident",
        },
        {
          status: "assigned",
          timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          note: "Assigned to Ward H/West SWM dumper",
        },
      ],
    },
    {
      id: "ISS-2026-094",
      reporter_id: "usr-res-1",
      category: "Streetlight",
      title:
        "Coastal lamp posts flickering and exposed junction box on promenade",
      description:
        "High tide saline corrosion caused electrical short circuit on heritage lamp post near Chowpatty end.",
      latitude: 18.948,
      longitude: 72.822,
      address: "Marine Drive Promenade, Near Chowpatty, South Mumbai",
      ward_id: "ward-8",
      priority: "high",
      status: "resolved",
      assigned_department: "dept-elec",
      assigned_to_id: "usr-field-2",
      upvotes_count: 31,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          note: "Reported",
        },
        {
          status: "resolved",
          timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
          note: "Junction box waterproofed and LED fixture replaced",
        },
      ],
    },
    // Kolkata Issues
    {
      id: "ISS-2026-095",
      reporter_id: "usr-res-1",
      category: "Water",
      title: "Underground municipal potable water supply pipe rupture",
      description:
        "Pressurized water gushing from underground pipeline cracking pavement and eroding tram line sub-base.",
      latitude: 22.552,
      longitude: 88.354,
      address: "Near Stephen Court, Park Street, Kolkata",
      ward_id: "ward-9",
      priority: "critical",
      status: "submitted",
      assigned_department: "dept-water",
      assigned_to_id: null,
      upvotes_count: 45,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          note: "Emergency water break reported",
        },
      ],
    },
    // Hyderabad Issues
    {
      id: "ISS-2026-097",
      reporter_id: "usr-res-1",
      category: "Pothole",
      title: "Deep asphalt depression near Cyber Towers flyover ramp",
      description:
        "Heavy IT corridor bus traffic has caused asphalt subsidence of over 5 inches at the merge point.",
      latitude: 17.4504,
      longitude: 78.3808,
      address: "Cyber Towers Junction, Madhapur, HITEC City, Hyderabad",
      ward_id: "ward-11",
      priority: "critical",
      status: "in_progress",
      assigned_department: "dept-pw",
      assigned_to_id: "usr-field-1",
      upvotes_count: 39,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
          note: "Reported by tech park commuter",
        },
        {
          status: "in_progress",
          timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          note: "GHMC cold-mix patch crew working",
        },
      ],
    },
    // Chennai Issues
    {
      id: "ISS-2026-099",
      reporter_id: "usr-res-1",
      category: "Water",
      title: "Storm water drain choked with silt causing waterlogging",
      description:
        "Post-rain waterlogging on South Usman Road commercial corridor due to silt accumulation in inlet grates.",
      latitude: 13.0405,
      longitude: 80.233,
      address: "South Usman Road, Near Panagal Park, T. Nagar, Chennai",
      ward_id: "ward-13",
      priority: "high",
      status: "submitted",
      assigned_department: "dept-water",
      assigned_to_id: null,
      upvotes_count: 18,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
          note: "Reported",
        },
      ],
    },
    // Pune Issues
    {
      id: "ISS-2026-100",
      reporter_id: "usr-res-1",
      category: "Streetlight",
      title: "Dark pedestrian crossing due to damaged high-mast light",
      description:
        "High mast lamp circuit tripped outside college entrance, making zebra crossing unsafe after sunset.",
      latitude: 18.5285,
      longitude: 73.842,
      address: "Fergusson College Road, Near Goodluck Cafe, Shivajinagar, Pune",
      city: "Pune",
      ward_id: "ward-14",
      ward_name: "Ward 12 - Shivajinagar & FC Road",
      priority: "medium",
      status: "assigned",
      assigned_department: "dept-elec",
      assigned_to_id: "usr-field-2",
      upvotes_count: 14,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
          note: "Reported",
        },
        {
          status: "assigned",
          timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
          note: "PMC electrical division assigned",
        },
      ],
    },
    // Lucknow Issue
    {
      id: "ISS-2026-101",
      reporter_id: "usr-res-1",
      category: "Roads",
      title: "Broken divider and pothole cluster near Hazratganj crossing",
      description:
        "Multiple deep potholes appearing around Hazratganj multi-level parking circle causing traffic crawl during peak evening hours.",
      latitude: 26.8488,
      longitude: 80.9452,
      address: "MG Marg, Near Hazratganj GPO, Lucknow, Uttar Pradesh",
      city: "Lucknow",
      ward_id: "ward-lucknow-hazratganj",
      ward_name: "Hazratganj Central",
      priority: "high",
      status: "assigned",
      assigned_department: "dept-pw",
      assigned_to_id: "usr-field-1",
      upvotes_count: 22,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          note: "Reported by Resident",
        },
        {
          status: "assigned",
          timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          note: "Lucknow Municipal Corporation PWD dispatched",
        },
      ],
    },
    // Jaipur Issue
    {
      id: "ISS-2026-102",
      reporter_id: "usr-res-1",
      category: "Water",
      title: "Overflowing drainage line submerging market street in Malviya Nagar",
      description:
        "Choked storm water drain overflowing on sector road outside local market. Strong stench and pedestrian blockage.",
      latitude: 26.8532,
      longitude: 75.8156,
      address: "Sector 3 Road, Near Gaurav Tower, Malviya Nagar, Jaipur, Rajasthan",
      city: "Jaipur",
      ward_id: "ward-jaipur-malviya",
      ward_name: "Malviya Nagar",
      priority: "high",
      status: "submitted",
      assigned_department: "dept-water",
      assigned_to_id: null,
      upvotes_count: 17,
      parent_issue_id: null,
      created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          note: "Reported by Resident",
        },
      ],
    },
  ],

  issueMedia: [
    {
      id: "med-081-1",
      issue_id: "ISS-2026-081",
      image_url:
        "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      media_type: "before",
    },
    {
      id: "med-082-1",
      issue_id: "ISS-2026-082",
      image_url:
        "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
      media_type: "before",
    },
    {
      id: "med-083-1",
      issue_id: "ISS-2026-083",
      image_url:
        "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
      media_type: "before",
    },
    {
      id: "med-083-2",
      issue_id: "ISS-2026-083",
      image_url:
        "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
      media_type: "after",
    },
    {
      id: "med-084-1",
      issue_id: "ISS-2026-084",
      image_url:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      media_type: "before",
    },
    {
      id: "med-085-1",
      issue_id: "ISS-2026-085",
      image_url:
        "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
      media_type: "before",
    },
    {
      id: "med-091-1",
      issue_id: "ISS-2026-091",
      image_url:
        "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      media_type: "before",
    },
    {
      id: "med-093-1",
      issue_id: "ISS-2026-093",
      image_url:
        "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
      media_type: "before",
    },
    {
      id: "med-094-1",
      issue_id: "ISS-2026-094",
      image_url:
        "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
      media_type: "before",
    },
    {
      id: "med-097-1",
      issue_id: "ISS-2026-097",
      image_url:
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80",
      media_type: "before",
    },
  ],

  comments: [
    {
      id: "comm-1",
      issue_id: "ISS-2026-081",
      user_id: "usr-res-1",
      message:
        "Thank you for taking this up. Two bike riders slipped here in the evening rain.",
      is_internal: false,
      created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    },
    {
      id: "comm-2",
      issue_id: "ISS-2026-081",
      user_id: "usr-field-1",
      message:
        "@aarav.resident PWD maintenance gang has barricaded the crater with safety cones. Bitumen patching will be completed by 3 PM.",
      is_internal: false,
      created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    },
    {
      id: "comm-3",
      issue_id: "ISS-2026-081",
      user_id: "usr-field-1",
      message:
        "INTERNAL NOTE: Sub-base eroded due to storm drain seepage. Proposed infrared asphalt restoration in upcoming ward development plan.",
      is_internal: true,
      created_at: new Date(Date.now() - 9 * 3600 * 1000).toISOString(),
    },
    {
      id: "comm-4",
      issue_id: "ISS-2026-082",
      user_id: "usr-help-1",
      message:
        "INTERNAL NOTE: SLA 48h exceeded. Escalating to BESCOM Sub-Division Engineer due to pedestrian safety concerns near bus stop.",
      is_internal: true,
      created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    },
  ],

  notifications: [
    {
      id: "notif-1",
      user_id: "usr-res-1",
      issue_id: "ISS-2026-081",
      message:
        'Status update: Your report "Deep crater pothole" is now In Progress by PWD.',
      is_read: false,
      created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    },
    {
      id: "notif-2",
      user_id: "usr-res-1",
      issue_id: "ISS-2026-083",
      message:
        'Resolved! Your report "Garbage blackspot on CMH Road" was resolved with after-photos.',
      is_read: false,
      created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    },
    {
      id: "notif-3",
      user_id: "usr-res-1",
      issue_id: "ISS-2026-082",
      message: "34 neighbors are now following your streetlight outage report.",
      is_read: true,
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ],

  helpDeskTickets: [
    {
      id: "HD-TICK-901",
      resident_id: "usr-res-1",
      related_issue_id: "ISS-2026-082",
      subject:
        "Urgent escalation: Streetlights non-functional for 3 nights near BMTC bus stop",
      status: "open",
      agent_id: "usr-help-1",
      priority: "high",
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      messages: [
        {
          sender_id: "usr-res-1",
          sender_role: "resident",
          text: "Namaste, the 4 streetlamps on 12th Main Koramangala have been dead for 3 nights. Women and senior citizens walk through here. Citizen Charter SLA has elapsed.",
          timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        },
        {
          sender_id: "usr-help-1",
          sender_role: "help_desk",
          text: "Namaste Aarav ji, I reviewed the dispatch logs. I have paged the BESCOM Junior Engineer and escalated priority to Critical. A hydraulic ladder truck has been scheduled.",
          timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        },
      ],
    },
    {
      id: "HD-TICK-902",
      resident_id: "usr-res-1",
      related_issue_id: "ISS-2026-085",
      subject: "Gulmohar branch cracking sound heard near 11kV line",
      status: "in_review",
      agent_id: "usr-help-1",
      priority: "critical",
      created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      messages: [
        {
          sender_id: "usr-res-1",
          sender_role: "resident",
          text: "The Gulmohar branch over the park swings is resting on electricity cables. Can the municipal team cordon off the area immediately?",
          timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        },
      ],
    },
  ],

  faqs: [
    {
      question:
        "What is the citizen charter resolution SLA for a pothole in the ward?",
      category: "Public Works (PWD)",
      answer:
        "Standard priority potholes have a Citizen Charter SLA of 48 business hours for temporary cold-mix patch filling. Permanent infrared/wet-mix hot asphalting is completed within 7 to 10 days. Arterial road hazards are inspected within 6 hours.",
    },
    {
      question:
        "Who handles sparking transformers or fallen overhead electricity cables?",
      category: "Electricity (BESCOM)",
      answer:
        "Fallen live wires or sparking distribution transformers are immediate life-safety emergencies. Dial 1912 (24x7 Electricity Helpline) or 112 immediately. Never approach within 35 feet of a fallen wire.",
    },
    {
      question:
        "How does community upvoting impact ward engineer prioritization?",
      category: "Citizen Portal",
      answer:
        "When multiple ward residents upvote an existing report or confirm via the 100m duplicate detection engine, the issue score rises in the Junior Engineer and Assistant Executive Engineer dispatch queue for immediate batch work.",
    },
    {
      question: 'Why is an "After" photo compulsory to resolve a ticket?',
      category: "Accountability & Audit",
      answer:
        'Under the Citizen Grievance Redressal Rules, municipal field personnel cannot mark an issue "Resolved" without uploading geo-tagged photo evidence taken on-site. The resident who filed the grievance receives this proof directly in their notification feed.',
    },
    {
      question:
        "How do I escalate an overdue civic issue to the Zonal Commissioner?",
      category: "Help Desk",
      answer:
        'If an issue exceeds the stipulated Citizen Charter SLA (e.g. 24h for electricity or 48h for roads), residents can click "Escalate Unresolved Issue" in the Help Desk tab. Our Citizen Assistance officers have direct paging authority to dispatch supervisory staff.',
    },
  ],

  emergencies: [
    {
      title: "Active LPG / Gas Pipeline Leak",
      phone: "1906 (or 112)",
      severity: "Immediate Danger",
      icon: "flame",
      color: "#ef4444",
      instruction:
        "Evacuate premises immediately on foot. Do not light matchsticks, candles, or operate electrical switches or phones near gas cylinder or pipeline.",
    },
    {
      title: "Downed Live Wire / Transformer Spark",
      phone: "1912 (or 112)",
      severity: "Electrocution Risk",
      icon: "zap",
      color: "#f59e0b",
      instruction:
        "Stay at least 35 feet away. High voltage danger. Keep children, pedestrians, and cattle away from water puddles near fallen cables.",
    },
    {
      title: "Major Water Main Burst / Road Cave-in",
      phone: "1916 (or 1533)",
      severity: "Structural Flooding",
      icon: "droplets",
      color: "#06b6d4",
      instruction:
        "Report geysers or road subsidence to Jal Board Rapid Response immediately to prevent undermining of road sub-base and structural foundation damage.",
    },
  ],
};

// Database Management Class
class CivicDatabase {
  constructor() {
    this.init();
  }

  init() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Clear legacy storage versions to refresh seeds with Pan-India data
      localStorage.removeItem("nagrikseva_db_v1");
      localStorage.removeItem("nagrikseva_db_v2");
      localStorage.removeItem("nagrikseva_db_v3");
      this.data = JSON.parse(JSON.stringify(SEED_DATA));
      this.save();
    } else {
      try {
        this.data = JSON.parse(stored);
        if (!this.data.faqs) this.data.faqs = SEED_DATA.faqs;
        if (!this.data.emergencies)
          this.data.emergencies = SEED_DATA.emergencies;
        // Merge in any new Pan-India wards/issues if missing
        if (
          !this.data.wards ||
          this.data.wards.length < SEED_DATA.wards.length
        ) {
          this.data.wards = SEED_DATA.wards;
        }
        if (
          !this.data.issues ||
          this.data.issues.length < SEED_DATA.issues.length
        ) {
          this.data.issues = SEED_DATA.issues;
          this.data.issueMedia = SEED_DATA.issueMedia;
        }
        this.save();
      } catch (e) {
        console.error(
          "Failed to parse local storage, resetting to seed data",
          e,
        );
        this.data = JSON.parse(JSON.stringify(SEED_DATA));
        this.save();
      }
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  resetToSeed() {
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
    this.save();
    return this.data;
  }

  // Users
  getUsers() {
    return this.data.users;
  }
  getUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  getUserByEmail(email) {
    return this.data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
  }
  createUser(userData) {
    const newUser = {
      id: "usr-" + Date.now().toString(36),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      password_hash: "argon2id$mock_" + Math.random().toString(36).slice(2),
      role: userData.role || "resident",
      ward_id: userData.ward_id || "ward-1",
      city: userData.city || "General",
      area: userData.area || "",
      department_id: userData.department_id || null,
      avatar: `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80`,
      address: userData.address || "",
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Issues
  getIssues() {
    return this.data.issues;
  }
  getIssueById(id) {
    return this.data.issues.find((i) => i.id === id);
  }

  createIssue(issueData) {
    const newId = "ISS-2026-" + (Math.floor(Math.random() * 900) + 100);
    const ward = this.getWardById(issueData.ward_id);
    const city = issueData.city || (ward ? ward.city : "India");
    const wardName = issueData.ward_name || (ward ? ward.name : "General Area");
    const lat = parseFloat(issueData.latitude) || (ward ? ward.lat : 20.5937);
    const lng = parseFloat(issueData.longitude) || (ward ? ward.lng : 78.9629);

    const newIssue = {
      id: newId,
      reporter_id: issueData.reporter_id,
      category: issueData.category,
      title: issueData.title,
      description: issueData.description,
      latitude: lat,
      longitude: lng,
      address: issueData.address,
      city: city,
      ward_id: issueData.ward_id || (ward ? ward.id : "ward-1"),
      ward_name: wardName,
      priority: issueData.priority || "medium",
      status: "submitted",
      assigned_department: issueData.assigned_department,
      assigned_to_id: issueData.assigned_to_id || null,
      upvotes_count: 1,
      parent_issue_id: issueData.parent_issue_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      timeline: [
        {
          status: "submitted",
          timestamp: new Date().toISOString(),
          note: `Issue reported by ${issueData.reporter_name || "Resident"}`,
        },
      ],
    };

    if (newIssue.assigned_department) {
      const dept = this.getDepartmentById(newIssue.assigned_department);
      newIssue.timeline.push({
        status: "assigned",
        timestamp: new Date().toISOString(),
        note: `System Auto-Routing: Forwarded to ${dept ? dept.name : "Responsible Unit"}`,
      });
      newIssue.status = "assigned";
    }

    this.data.issues.unshift(newIssue);

    if (issueData.photos && Array.isArray(issueData.photos)) {
      issueData.photos.forEach((photoUrl, idx) => {
        this.data.issueMedia.push({
          id: `med-${newId}-${idx + 1}`,
          issue_id: newId,
          image_url: photoUrl,
          media_type: "before",
        });
      });
    }

    this.createNotification({
      user_id: issueData.reporter_id,
      issue_id: newId,
      message: `Your report #${newId} "${issueData.title}" was submitted and auto-routed to ${this.getDepartmentById(newIssue.assigned_department)?.name || "Operations"}.`,
    });

    this.save();
    return newIssue;
  }

  updateIssue(id, updates) {
    const issue = this.getIssueById(id);
    if (!issue) return null;
    Object.assign(issue, updates, { updated_at: new Date().toISOString() });
    this.save();
    return issue;
  }

  updateIssueStatus(
    id,
    newStatus,
    note,
    afterPhotoUrl = null,
    updatedBy = "Staff",
  ) {
    const issue = this.getIssueById(id);
    if (!issue) return null;

    issue.status = newStatus;
    issue.updated_at = new Date().toISOString();
    if (!issue.timeline) issue.timeline = [];

    issue.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${newStatus} by ${updatedBy}`,
    });

    if (newStatus === "resolved" && afterPhotoUrl) {
      this.data.issueMedia.push({
        id: `med-${id}-after-${Date.now()}`,
        issue_id: id,
        image_url: afterPhotoUrl,
        media_type: "after",
      });
    }

    this.createNotification({
      user_id: issue.reporter_id,
      issue_id: id,
      message: `Status updated to "${newStatus.toUpperCase()}" for report #${id} ("${issue.title}").`,
    });

    this.save();
    return issue;
  }

  upvoteIssue(id, userId) {
    const issue = this.getIssueById(id);
    if (!issue) return null;
    issue.upvotes_count = (issue.upvotes_count || 0) + 1;
    this.createNotification({
      user_id: issue.reporter_id,
      issue_id: id,
      message: `A neighbor just endorsed your report #${id}! Total endorsements: ${issue.upvotes_count}.`,
    });
    this.save();
    return issue.upvotes_count;
  }

  bulkAssignIssues(issueIds, assignedToId, departmentId) {
    const staff = this.getUserById(assignedToId);
    issueIds.forEach((id) => {
      const issue = this.getIssueById(id);
      if (issue) {
        issue.assigned_to_id = assignedToId;
        if (departmentId) issue.assigned_department = departmentId;
        if (issue.status === "submitted") issue.status = "assigned";
        issue.updated_at = new Date().toISOString();
        if (!issue.timeline) issue.timeline = [];
        issue.timeline.push({
          status: "assigned",
          timestamp: new Date().toISOString(),
          note: `Assigned to ${staff ? staff.name : "Field Staff"}`,
        });
      }
    });
    this.save();
    return true;
  }

  mergeIssues(primaryIssueId, duplicateIssueIds) {
    const primary = this.getIssueById(primaryIssueId);
    if (!primary) return false;

    duplicateIssueIds.forEach((dupId) => {
      const dup = this.getIssueById(dupId);
      if (dup) {
        dup.parent_issue_id = primaryIssueId;
        dup.status = "closed";
        primary.upvotes_count =
          (primary.upvotes_count || 0) + (dup.upvotes_count || 1);
        dup.timeline.push({
          status: "closed",
          timestamp: new Date().toISOString(),
          note: `Closed as duplicate of primary issue #${primaryIssueId}`,
        });
        this.createNotification({
          user_id: dup.reporter_id,
          issue_id: primaryIssueId,
          message: `Your report #${dupId} was merged into active parent report #${primaryIssueId}. You are now tracking the consolidated report.`,
        });
      }
    });
    this.save();
    return true;
  }

  // 100m Proximity duplicate query
  findNearbyDuplicates(lat, lng, category, radiusMeters = 100) {
    const R = 6371e3; // Earth radius in meters
    const matches = [];

    this.data.issues.forEach((issue) => {
      if (issue.status === "closed") return;
      if (issue.category.toLowerCase() !== category.toLowerCase()) return;

      const φ1 = (lat * Math.PI) / 180;
      const φ2 = (issue.latitude * Math.PI) / 180;
      const Δφ = ((issue.latitude - lat) * Math.PI) / 180;
      const Δλ = ((issue.longitude - lng) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      if (distance <= radiusMeters) {
        const photos = this.getIssueMedia(issue.id);
        matches.push({
          ...issue,
          distanceMeters: Math.round(distance),
          primaryPhoto: photos.length > 0 ? photos[0].image_url : null,
        });
      }
    });

    return matches.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  getIssueMedia(issueId) {
    return this.data.issueMedia.filter((m) => m.issue_id === issueId);
  }

  getComments(issueId) {
    return this.data.comments
      .filter((c) => c.issue_id === issueId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  createComment(commentData) {
    const newComment = {
      id: "comm-" + Date.now().toString(36),
      issue_id: commentData.issue_id,
      user_id: commentData.user_id,
      message: commentData.message,
      is_internal: !!commentData.is_internal,
      created_at: new Date().toISOString(),
    };
    this.data.comments.push(newComment);

    if (!newComment.is_internal) {
      const issue = this.getIssueById(commentData.issue_id);
      if (issue && issue.reporter_id !== commentData.user_id) {
        const user = this.getUserById(commentData.user_id);
        this.createNotification({
          user_id: issue.reporter_id,
          issue_id: issue.id,
          message: `${user ? user.name : "Staff"} commented on report #${issue.id}: "${commentData.message.slice(0, 50)}..."`,
        });
      }
    }

    this.save();
    return newComment;
  }

  getNotifications(userId) {
    return this.data.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  markNotificationAsRead(id) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.save();
    }
  }

  markAllNotificationsAsRead(userId) {
    this.data.notifications.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    this.save();
  }

  createNotification(notifData) {
    const notif = {
      id:
        "notif-" +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 5),
      user_id: notifData.user_id,
      issue_id: notifData.issue_id || null,
      message: notifData.message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  getHelpDeskTickets() {
    return this.data.helpDeskTickets.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }

  getHelpDeskTicketById(id) {
    return this.data.helpDeskTickets.find((t) => t.id === id);
  }

  createHelpDeskTicket(ticketData) {
    const newId = "HD-TICK-" + (Math.floor(Math.random() * 900) + 100);
    const newTicket = {
      id: newId,
      resident_id: ticketData.resident_id,
      related_issue_id: ticketData.related_issue_id,
      subject: ticketData.subject,
      status: "open",
      agent_id: "usr-help-1",
      priority: ticketData.priority || "high",
      created_at: new Date().toISOString(),
      messages: [
        {
          sender_id: ticketData.resident_id,
          sender_role: "resident",
          text: ticketData.message,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    this.data.helpDeskTickets.unshift(newTicket);
    this.save();
    return newTicket;
  }

  addHelpDeskMessage(ticketId, senderId, senderRole, text) {
    const ticket = this.getHelpDeskTicketById(ticketId);
    if (!ticket) return null;
    ticket.messages.push({
      sender_id: senderId,
      sender_role: senderRole,
      text: text,
      timestamp: new Date().toISOString(),
    });
    this.save();
    return ticket;
  }

  pingDepartment(ticketId, note = "High priority citizen escalation") {
    const ticket = this.getHelpDeskTicketById(ticketId);
    if (!ticket) return false;
    const issue = this.getIssueById(ticket.related_issue_id);
    if (issue) {
      this.createComment({
        issue_id: issue.id,
        user_id: "usr-help-1",
        message: `HELP DESK PING: Ticket #${ticket.id} escalated to assigned department. Resident reports ongoing delay: "${note}"`,
        is_internal: true,
      });
    }
    return true;
  }

  escalateTicketPriority(ticketId, newPriority = "critical") {
    const ticket = this.getHelpDeskTicketById(ticketId);
    if (!ticket) return false;
    ticket.priority = newPriority;
    ticket.status = "escalated";
    if (ticket.related_issue_id) {
      const issue = this.getIssueById(ticket.related_issue_id);
      if (issue) {
        issue.priority = newPriority;
        issue.updated_at = new Date().toISOString();
        issue.timeline.push({
          status: issue.status,
          timestamp: new Date().toISOString(),
          note: `Help Desk Agent escalated priority to ${newPriority.toUpperCase()} via grievance #${ticket.id}`,
        });
      }
    }
    this.save();
    return true;
  }

  getWards() {
    return this.data.wards;
  }

  getWardById(id) {
    if (!id) {
      return {
        id: "ward-general",
        name: "General Area",
        zone: "General Zone",
        city: "India",
        lat: 20.5937,
        lng: 78.9629,
      };
    }
    const found = this.data.wards.find((w) => w.id === id);
    if (found) return found;

    // Gracefully handle dynamic ward IDs like ward-lucknow-hazratganj
    const cleanId = id.replace(/^ward-/, "");
    const parts = cleanId.split("-");
    const inferredCity = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : "India";
    const rawArea = parts.slice(1).join(" ") || "General Locality";
    const inferredArea = rawArea.charAt(0).toUpperCase() + rawArea.slice(1);
    const coords = getCoordsForCity(inferredCity);

    return {
      id: id,
      name: inferredArea,
      zone: `${inferredCity} Municipal Zone`,
      city: inferredCity,
      lat: coords.lat,
      lng: coords.lng,
    };
  }

  findOrCreateWard(cityName, areaName) {
    const cityClean = (cityName || "India").trim();
    const areaClean = (areaName || "Main Area").trim();
    const safeCitySlug = cityClean.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const safeAreaSlug = areaClean.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 24);
    const wardId = `ward-${safeCitySlug}-${safeAreaSlug}`;

    let existing = this.data.wards.find(
      (w) =>
        w.id === wardId ||
        (w.city &&
          w.name &&
          w.city.toLowerCase() === cityClean.toLowerCase() &&
          w.name.toLowerCase() === areaClean.toLowerCase())
    );

    if (existing) return existing;

    const coords = getCoordsForCity(cityClean);
    const jitterLat = (Math.random() - 0.5) * 0.03;
    const jitterLng = (Math.random() - 0.5) * 0.03;

    const newWard = {
      id: wardId,
      name: areaClean,
      zone: `${cityClean} Municipal Zone`,
      city: cityClean,
      lat: parseFloat((coords.lat + jitterLat).toFixed(4)),
      lng: parseFloat((coords.lng + jitterLng).toFixed(4)),
    };

    this.data.wards.push(newWard);
    this.save();
    return newWard;
  }
  getDepartments() {
    return this.data.departments;
  }
  getDepartmentById(id) {
    return this.data.departments.find((d) => d.id === id);
  }
  getFaqs() {
    return this.data.faqs;
  }
  getEmergencies() {
    return this.data.emergencies;
  }
}

// Global Singleton
window.CivicDB = new CivicDatabase();
