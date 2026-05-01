const mongoose = require("mongoose");
require("dotenv").config();

const Service = require("./models/Service");

const services = [
  {
    title: "Waste Collection",
    category: "Waste",
    description: "Request waste collection or report missed bins.",
    contact: {
      phone: "0412345678",
      email: "waste@citylink.com",
    },
  },
  {
    title: "Rates Enquiry",
    category: "Finance",
    description: "View and pay your rates.",
    contact: {
      phone: "0412345679",
      email: "rates@citylink.com",
    },
  },
  {
    title: "Permits & Licences",
    category: "Permits",
    description: "Apply for permits and licences.",
    contact: {
      phone: "0412345680",
      email: "permits@citylink.com",
    },
  }
];

async function seedServices() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Service.deleteMany({});
    await Service.insertMany(services);

    console.log("Services seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
}

seedServices();