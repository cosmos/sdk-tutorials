#!/bin/node

const fs = require('fs');

REQUIRED_FIELDS = [ "theme", "title", "head", "themeConfig", "plugins", "patterns"];
REQUIRED_THEME_FIELDS = ["isIDAMode", "label", "sidebar"]

let errCount = 0;
console.log("checking config file consistency..")

const config = require("./.vuepress/config.js")

// check required fields

REQUIRED_FIELDS.forEach((f) => {
	if (typeof config[f] === "undefined") {
		console.log(`ERROR: Config field ${f} is missing`);
		reportError();
	}
})

REQUIRED_THEME_FIELDS.forEach((f) => {
	if (typeof config.themeConfig[f] === "undefined") {
		console.log(`ERROR: ThemeConfig field ${f} is missing`);
		reportError();
	}
})


// check sidebar links
const nav = config.themeConfig.sidebar.nav;

nav.forEach((item) => {
	checkNavItem(item);
})

if (errCount > 0) {
	console.log(`Found ${errCount} error${errCount > 0 ? "s" : ""} in config!`);
	process.exit(1);
} else {
	console.log("Config file is valid.");
}


/* Helpers */

function checkNavItem(item) {
	if (typeof item.title === "undefined") {
		console.log("ERROR: Nav item is missing title! item:");
		console.log(item);
		reportError();
	}

	if (typeof item.children === "undefined" && typeof item.path === "undefined") {
		console.log("ERROR: Nav item must define either path or children! item:");
		console.log(item);
		reportError();
	}

	if (typeof item.children !== "undefined") {
		if(!Array.isArray(item.children)) {
			console.log("ERROR: Nav item children must be an array! item:");
			console.log(item);
			reportError();
		}

		item.children.forEach((sub) => { checkNavItem(sub) });
	}

	if (typeof item.path !== "undefined") {
		if (item.path.charAt(0) != "/") {
			console.log("ERROR: Nav item path must start with '/'");
			console.log(item.path);
		}
		if (item.directory) {
			if(item.path.charAt(item.path.length-1) != "/") {
				console.log("ERROR: Directory nav item path must end with '/'");
				console.log(item.path);
				reportError();
			}

			//if (!fs.existsSync)
		}
		if (/index\.html$/.test(item.path)) {
			console.log("ERROR: Directory nav item path should not end with index.html - link to the folder instead");
			reportError();
		}
		if (!fs.existsSync(`.${item.path.replace(".html", ".md")}`)) {
			console.log("ERROR: invalid nav item file path:");
			console.log(item.path);
			reportError();
		}
	}
}

function reportError() {
	errCount++;
}