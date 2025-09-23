"use client";

let jyAPIbaseUrl = "/api";

if (typeof window !== "undefined") {
  switch (window.location.host) {
    case "jyadmin.ketchup.studio":
      jyAPIbaseUrl = "https://ketchup.studio/jyapi";
      break;
    default:
      jyAPIbaseUrl = "https://ketchup.studio/jyapi";
      break;
  }
}

export { jyAPIbaseUrl };
