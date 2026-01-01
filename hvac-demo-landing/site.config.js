export const SITE_CONFIG = {
  companyName: "Blue Ridge Heating & Air",
  tagline: "Repairs, maintenance, and emergency service",

  phoneDisplay: "(443) 665-0603",
  phoneTel: "+14436650603",

  primaryCity: "Baltimore, MD",
  serviceAreas: ["Baltimore", "Towson", "Catonsville", "Parkville", "Dundalk", "Surrounding areas"],

  // Branding images (add files under /assets/brand/)
  // Use absolute paths so assets load correctly on all routes (e.g., /dashboard), and add a small cache-buster.
  logoUrl: "/assets/brand/logo.jpg?v=20251228",
  ratingBannerUrl: "/assets/brand/rating-banner.jpg?v=20251228",
  satisfactionSealUrl: "/assets/brand/satisfaction-seal.jpg?v=20251228",

  // Optional hero / about photos (leave blank if not used)
  heroImageUrl: "",
  aboutImageUrl: "",

  services: [
    // NOTE: If you want image icons here, upload them into `assets/brand/` and set `iconUrl`.
    { title: "AC Repair", desc: "Restore cooling fast with clear options and upfront approval.", icon: "❄" },
    { title: "Furnace Repair", desc: "Diagnose no-heat and safety issues with straightforward next steps.", icon: "🔥" },
    { title: "Heat Pumps", desc: "Troubleshooting, repairs, and replacement guidance for your home.", icon: "♨" },
    { title: "Maintenance", desc: "Seasonal tune-ups to reduce breakdowns and improve comfort.", icon: "🧰" },
    { title: "Thermostats", desc: "Smart thermostat installs, wiring fixes, and schedule setup.", icon: "🎛" },
    { title: "Ductwork", desc: "Airflow issues, leaks, and comfort balancing without guesswork.", icon: "🌀" },
    { title: "Indoor Air Quality", desc: "Filtration and humidity solutions for cleaner, comfortable air.", icon: "🌬" },
    { title: "Emergency Service", desc: "Urgent response for no-heat/no-AC situations when it can’t wait.", icon: "⚡" },
  ],

  testimonials: [
    {
      name: "Sarah M.",
      city: "Baltimore",
      text:
        "Called in the morning and got a clear plan right away. They explained options before starting work and kept it simple.",
      stars: 5,
    },
    {
      name: "Mike T.",
      city: "Towson",
      text:
        "Quick response and good communication. The tech explained what failed and what it would take to fix it before touching anything.",
      stars: 5,
    },
    {
      name: "Jennifer K.",
      city: "Catonsville",
      text:
        "On time and respectful of the house. Diagnosed the issue fast and gave a couple of options to choose from.",
      stars: 5,
    },
    {
      name: "David R.",
      city: "Parkville",
      text:
        "Requested service online and got a callback quickly. Showed up on time and finished the repair without any surprises.",
      stars: 5,
    },
    {
      name: "Ashley P.",
      city: "Dundalk",
      text:
        "Great communication from start to finish. We got options before any work began and the house was comfortable again that evening.",
      stars: 5,
    },
    {
      name: "Kevin S.",
      city: "Baltimore",
      text:
        "Professional, clean work. The tech walked me through what failed and what to watch for going forward.",
      stars: 4,
    },
  ],

  hours: "Mon–Sun: 8am–8pm",
  emergencyLine: "Emergency service available",
  licenseNumber: "",

  about:
    "Locally owned HVAC team serving the greater Baltimore area. Licensed and insured. Clear options before any work begins — and clear communication start to finish.",

  trustStrip: ["Licensed & insured", "Background-checked techs", "Upfront options", "Fast response"],

  theme: {
    primaryColor: "#0b5fff",
    accentColor: "#083a9a",
  },

  enableHeroImage: false,
  heroBackgroundImageUrl: "",
};




