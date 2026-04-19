const pptxgen = require("pptxgenjs");
const path = require("path");

let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

// ------------------------------------
// Slide 1 - Title Slide
// ------------------------------------
let slide1 = pres.addSlide();
slide1.background = { fill: "FFFFFF" };

// Header: Red background
slide1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.1, fill: "DD1A22" });

slide1.addText("DEPARTMENT OF\nComputer Science", { 
    x: 0, y: 0.1, w: "100%", h: 0.9, 
    fontSize: 24, color: "FFFFFF", bold: true, align: "center", fontFace: "Arial" 
});

slide1.addText("JECRC UNIVERSITY", { 
    x: 7.5, y: 0.1, w: 2.0, h: 0.9, 
    fontSize: 16, color: "FFFFFF", bold: true, align: "right" 
});

// Title: Mid Review Internship Presentation
slide1.addText("Mid Review Internship Presentation", {
    x: 0, y: 1.4, w: "100%", h: 0.8,
    fontSize: 44, color: "FF0000", bold: true, align: "center", fontFace: "Arial"
});

// Presented by Section
slide1.addText("Presented by\n<Name of the Student>\nUnder the guidance of", {
    x: "25%", y: 2.5, w: "50%", h: 1,
    fontSize: 18, color: "000000", align: "center", bold: true, lineSpacing: 25
});

// Sub-logos section
slide1.addText("<COMPANY LOGO>", {
    x: "65%", y: 3.2, w: 2.5, h: 0.5,
    fontSize: 18, color: "000000", align: "center", bold: true
});

slide1.addText("JECRC\nUNIVERSITY", {
    x: 1.0, y: 3.0, w: 2.0, h: 0.8,
    fontSize: 18, color: "444444", align: "center", bold: true
});

// Guides
slide1.addText("Faculty Internship guide:-\n<FIG DETAILS>", {
    x: 0.5, y: 4.2, w: 4, h: 1,
    fontSize: 16, color: "000000", bold: true
});

slide1.addText("Industrial guide:-\n<GUIDE DETAILS>", {
    x: 6.5, y: 4.2, w: 4, h: 1,
    fontSize: 16, color: "000000", bold: true
});

// Footer
slide1.addText("2025-2026", {
    x: 0, y: 5.2, w: "100%", h: 0.4,
    fontSize: 18, color: "000000", bold: true, align: "center"
});


// ------------------------------------
// Slide 2 - Contents Slide
// ------------------------------------
let slide2 = pres.addSlide();
slide2.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: "DD1A22" });
slide2.addText("Contents", { 
    x: 0, y: 0, w: "100%", h: 1.0, 
    fontSize: 36, color: "FFFFFF", bold: true, align: "center" 
});

const contents = [
    "Company Profile",
    "Internship Role",
    "Project Introduction",
    "Overall Learning",
    "Roles and Responsibilities",
    "Tools Used",
    "Methodology",
    "Outcomes",
    "Conclusion"
];

let items = contents.map(text => ({ text, options: { bullet: { type: "number" }, fontSize: 24, color: "555555", bold: true } }));
slide2.addText(items, {
    x: 0.8, y: 1.2, w: "90%", h: 4.0, margin: 10, lineSpacing: 35
});


// ------------------------------------
// Slides 3+ : Content Breakdown Pages
// ------------------------------------
// Create a separate slide for each of the content topics 
// to give you space for filling in details as shown in the second photo.
contents.forEach(item => {
    let slide = pres.addSlide();
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.0, fill: "DD1A22" });
    slide.addText(item, { 
        x: 0, y: 0, w: "100%", h: 1.0, 
        fontSize: 36, color: "FFFFFF", bold: true, align: "center" 
    });
    slide.addText("Add your " + item + " content here...", {
        x: 0.5, y: 1.5, w: "90%", h: 3.5, fontSize: 24, color: "888888", align: "center", italic: true
    });
});

// ------------------------------------
// Save Presentation 
// ------------------------------------
const outputPath = path.join(require('os').homedir(), "Desktop", "Internship_Presentation.pptx");

pres.writeFile({ fileName: outputPath }).then(fileName => {
    console.log(`Successfully created presentation at ${fileName}`);
}).catch(err => {
    console.error(err);
});
