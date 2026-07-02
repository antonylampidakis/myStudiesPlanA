
document.addEventListener("DOMContentLoaded", function () {

    // Επιλογή όλων των κουμπιών πλοήγησης μεταξύ εξαμήνων
    const buttons = document.querySelectorAll(".tab-button");

    // Επιλογή όλων των πινάκων βαθμολογίας για τα εξάμηνα
    const tables = document.querySelectorAll(".semester-table");
    
    // Προσθήκη event listener σε κάθε κουμπί
    buttons.forEach(button => {
        button.addEventListener("click", function () {
            // Αφαίρεση του active από όλα τα κουμπιά
            buttons.forEach(btn => btn.classList.remove("active"));
            // Προσθήκη active στο κουμπί που πατήθηκε
            button.classList.add("active");

            // Απόκρυψη όλων των πινάκων
            tables.forEach(table => table.classList.add("hidden"));

            // Εμφάνιση του σχετικού πίνακα
            const target = document.getElementById(button.getAttribute("data-target"));
            if (target) {
                target.classList.remove("hidden");
            }
        });
    });
});



//Πληροφροριες για το καθε μαθημα 
const courses = {
    "math1": {
        title: "Γραμμική Άλγεβρα",
        professor: "Γιανοπουλου Αρχοντια , Νακος Βασιλειος ",
        grades: [1,1,6], 
        link: "https://eclass.uoa.gr/courses/DI583/"
    },
    "math2": {
        title: "Διακριτά Μαθηματικά",
        professor: "Τζαμος χρηστος",
        grades: [2,6],
        link: "https://eclass.uoa.gr/courses/D268/"
    },
    "math3": {
        title: "Εισαγωγή στην Πληροφορική και στις Τηλεπικοινωνίες",
        professor: "Μαρία Ρούσσου",
        grades: [7], 
        link: "https://eclass.uoa.gr/courses/D253/"
    },
    "math4": {
        title: "Εισαγωγή στον Προγραμματισμό",
        professor: "Παναγιώτη Σταματόπουλο,Θανάσης Αυγερινός",
        grades: [4,3,5], 
        link: "https://eclass.uoa.gr/courses/DI649/"
    },
    "math5": {
        title: "Λογική Σχεδίαση",
        professor: " Βασίλειος Καρακώστας, Διονύσης Βασιλόπουλος",
        grades: [0,2,0,5], 
        link: "https://eclass.uoa.gr/courses/D13/"
    },
    "math6": {
        title: "Ανάλυση Ι",
        professor: "Δοδος Παντελειμον,Τιρος Κωσταντινος, Σμιρνελης Παναγιώτης	 ",
        grades: [1,3,0,0,10], 
        link: "https://eclass.uoa.gr/courses/DI496/"
    },
    "math7": {
        title: "Αρχιτεκτονική Υπολογιστών Ι",
        professor: "Γκιζόπουλος Δημήτρης",
        grades: [7], 
        link: "https://eclass.uoa.gr/courses/D19/"
    },
    "math8": {
        title: "Δομές Δεδομένων και Τεχνικές Προγραμματισμού",
        professor: "Κουμπαράκης Μανόλης",
        grades: [3,3,6], 
        link: "https://eclass.uoa.gr/courses/DI497/"
    },
    "math9": {
        title: "Ηλεκτρομαγνητισμός – Οπτική και Σύγχρονη Φυσική",
        professor: "Α.Τσίπουρας",
        grades: [0], 
        link: "https://eclass.uoa.gr/courses/D17/"
    },
    "math10": {
        title: "Ανάλυση ΙΙ",
        professor: "Γιώργος Χαλκιάς",
        grades: [6], 
        link: "https://eclass.uoa.gr/courses/D260/"
    },
    "math11": {
        title: "Αντικειμενοστραφής Προγραμματισμός",
        professor: " Αναστασία Λυγίζου",
        grades: [3.5,3.5,6], 
        link: "https://eclass.uoa.gr/courses/DI632/"
    },
    "math12": {
        title: "Πιθανότητες και Στατιστική",
        professor: "Αχλιόπτας Δημήτρης",
        grades: [3.5,0,7], 
        link: "https://eclass.uoa.gr/courses/DI617/"
    },
    "math13": {
        title: "Σήματα και Συστήματα",
        professor: "Γιάννης Παναγάκης",
        grades: [5], 
        link: "https://eclass.uoa.gr/courses/DI539/"
    },
    "math14": {
        title: "Αλγόριθμοι και Πολυπλοκότητα",
        professor: "Γιαννοπούλου Αρχοντία",
        grades: [4,4,4,7], 
        link: "https://eclass.uoa.gr/courses/D469/"
    },
    "math15": {
        title: "Δίκτυα Επικοινωνιών I",
        professor: "Σταυρακάκης Ιωάννης",
        grades: [2,2,1,5], 
        link: "https://eclass.uoa.gr/courses/DI410/"
    },
    "math16": {
        title: "Εργαστήριο Δικτύων Επικοινωνιών Ι",
        professor: "Νάσος Βάιος",
        grades: [7], 
        link: "https://eclass.uoa.gr/courses/DI349/"
    },
    "math17": {
        title: "Συστήματα Επικοινωνιών",
        professor: "Γεώργιος Αλεξανδρόπουλος,ΓΕΩΡΓΙΟΣ ΚΑΝΕΛΛΟΣ",
        grades: [0,7], 
        link: "https://eclass.uoa.gr/courses/DI657/"
    },
    "math18": {
        title: "Σχεδίαση και Χρήση Βάσεων Δεδομένων",
        professor: "Γιάννης Ιωαννίδης, Μαρία Ρούσσου",
        grades: [4,0,7],
        link: "https://eclass.uoa.gr/courses/D47/"
    },
    "math19": {
        title: "Λειτουργικά Συστήματα",
        professor: "Στάθης Χατζηευθυμιάδης",
        grades: [1], 
        link: "https://eclass.uoa.gr/courses/D244/"
    },
    "math20": {
        title: "Παραληλα συστηματα",
        professor: "Βασίλειος Καρακώστας",
        grades: [5], 
        link: "https://eclass.uoa.gr/courses/DI611/"
    },
    "math21": {
        title: "Ψυφιακη προσβασημοτητα και υποστηρικτικες τεχνολογιες πληροφορικης",
        professor: "Γεώργιος Κουρουπέτρογλου και Αλέξανδρος Πίνο",
        grades: [6], 
        link: "https://eclass.uoa.gr/courses/ΥΣ22"
    },
    "math22": {
        title: "Αρχιτεκτονική Υπολογιστών ΙΙ",
        professor: "Γκιζόπουλος Δημήτρης",
        grades: [2,7], 
        link: "https://eclass.uoa.gr/courses/D52/"
    },
    "math23": {
        title: "Υλοποίηση Συστημάτων Βάσεων Δεδομένων",
        professor: "Γιάννης Ιωαννίδης",
        grades: [7],
        link: "https://eclass.uoa.gr/courses/D22/"
    },
    "math24": {
        title: "Δομη και θεσμοί της ευρωπαϊκής ένωσης",
        professor: "Τολιδης Ιωαννης",
        grades: [9],
        link: "https://eclass.uoa.gr/courses/D80/"
    },
    "math25": {
        title: "Προγραμματισμός Συστήματος",
        professor: "Αλέξανδρος Ντούλας",
        grades: [9], 
        link: "https://eclass.uoa.gr/courses/DI507/"
    },
    "math26": {
        title: "Τεχνολογίες Εφαρμογών Διαδικτύου",
        professor: " Χαμόδρακας Ιωάννης",
        grades: [9], 
        link: "https://eclass.uoa.gr/courses/D53/"
    },
    "math27": {
        title: "Διοίκηση Έργων και Τεχνικές Παρουσίασης και Συγγραφής Επιστημονικών Εκθέσεων",
        professor: " Τολιδης Ιωαννης",
        grades: [7], 
        link: "https://eclass.uoa.gr/courses/"

    },
     "math28": {
        title: "Διδακτική της Πληροφορικής",
        professor: " Γόγουλου Αγορίτσα",
        grades: [7], 
        link: "https://eclass.uoa.gr/courses/DI684/"
    },
     "math29": {
        title: "Τεχνολογίες της Πληροφορίας και των Επικοινωνιών (ΤΠΕ) στη Μάθηση",
        professor: " Γόγουλου Αγορίτσα",
       grades: [6], 
        link: "https://eclass.uoa.gr/courses/DI685/"
    },
     "math30": {
        title: "Επικοινωνία Ανθρώπου Μηχανής",
        professor: " Μαρία Ρούσσου",
        grades: [], 
        link: "https://eclass.uoa.gr/courses/D54/"
    },
     "math31": {
        title: "Δίκτυα Επικοινωνιών II",
        professor: " Κωνσταντίνος Χριστοδουλόπουλος",
        grades: [], 
        link: "https://eclass.uoa.gr/courses/DI540/"
    },
     "math32": {
        title: "Τηλεπικοινωνιακά Δίκτυα",
        professor: " Βαρουτάς Δημήτρης",
        grades: [], 
        link: "https://eclass.uoa.gr/courses/D76/"
    },
     "math33": {
        title: "Συστήματα Κινητών και Προσωπικών Επικοινωνιών",
        professor: " Νίκος Πασσάς",
        grades: [], 
        link: "https://eclass.uoa.gr/courses/D74/"
    },
     "math34": {
        title: "Ψηφιακή Επεξεργασία Σήματος",
        professor: " Γεώργιος Αλεξανδρόπουλος",
        grades: [0], 
        link: "https://eclass.uoa.gr/courses/"
    },
     "math35": {
        title: "Σχολική Τάξη & Μικροδιδασκαλία",
        professor: " Μαρία Γρηγοριάδου",
        grades: [8], 
        link: "https://eclass.uoa.gr/courses/"
    },
     "math36": {
        title: "Διαχείριση Δικτύων",
        professor: " Alonistioti Nancy",
        grades: [], 
        link: "https://eclass.uoa.gr/courses/D73/"
    },
     "math37": {
        title: "Ψηφιακές Επικοινωνίες",
        professor: " ",
        grades: [8.5], 
        link: "https://eclass.uoa.gr/courses/"
    },
     "math38": {
        title: "Θεωρία Πληροφορίας και Κωδίκων",
        professor: " Γεώργιος Αλεξανδρόπουλος",
        grades: [], 
        link: "https://eclass.uoa.gr/courses/"
    },
     "math39": {
        title: "Project -  Ανάπτυξη Λογισμικού για Συστήματα Δικτύων και Τηλεπικοινωνιών",
        professor: " Alonistioti Nancy",
        grades: [],  
        link: "https://eclass.uoa.gr/courses/DI292/"
    },
     "math40": {
        title: "Πρακτηκη Ασκηση Ι&ΙΙ",
        professor: " Νίκος Πασσάς",
        grades: [], 
        link: "https://eclass.uoa.gr/courses/DI580/"
    },
    
};

function showInfo(courseId) {

    // Ανάκτηση των δεδομένων του μαθήματος από το αντικείμενο "courses"
    const course = courses[courseId];
    
    // Ενημέρωση του τίτλου του μαθήματος στο παράθυρο πληροφοριών
    document.getElementById("course-title").innerText = course.title;
    
    // Εμφάνιση του ονόματος του καθηγητή
    document.getElementById("course-professor").innerText = "Καθηγητής: " + course.professor;
    
    // Εμφάνιση των βαθμών του μαθήματος (οι βαθμοί χωρίζονται με κόμμα)
    document.getElementById("course-grades").innerText = "Βαθμοί: " + course.grades.join(", ");
    
    // Δημιουργία συνδέσμου προς το eClass του μαθήματος
    document.getElementById("course-link").innerHTML = `<a href="${course.link}" target="_blank">🔗 Πρόσβαση στο eClass</a>`;

    // Εμφάνιση του παράθυρου πληροφοριών (αφαίρεση της κλάσης "hidden")
    document.getElementById("info-box").classList.remove("hidden");
}

function hideInfo() {

    // Προσθήκη της κλάσης "hidden" για να εξαφανιστεί το παράθυρο πληροφοριών
    document.getElementById("info-box").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", async () => {
  const slot = document.getElementById("sidebar-slot");
  if (!slot) return;

  try {
    const res = await fetch("sidebar.html", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load sidebar.html");
    slot.innerHTML = await res.text();
    updateProgressBarFromECTS();

    // Προαιρετικό: highlight το active link στο sidebar
    const current = location.pathname.split("/").pop() || "index.html";
    slot.querySelectorAll("a[href]").forEach(a => {
      if (a.getAttribute("href") === current) a.classList.add("active-link");
    });

  } catch (e) {
    console.error(e);
    slot.innerHTML = "<!-- Sidebar failed to load -->";
  }
});

function updateProgressBarFromECTS() {
  const ectsEl = document.getElementById("ects-text");
  const bar = document.getElementById("progress-bar");

  if (!ectsEl || !bar) return;

  // Παίρνουμε το κείμενο π.χ. "🎓 ECTS: 161/ 240"
  const text = ectsEl.textContent;

  // Βρίσκουμε current/total με regex
  const match = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return;

  const current = parseInt(match[1], 10);
  const total = parseInt(match[2], 10);

  if (!Number.isFinite(current) || !Number.isFinite(total) || total <= 0) return;

  let percentage = (current / total) * 100;

  // clamp 0..100
  percentage = Math.max(0, Math.min(100, percentage));

  bar.style.width = percentage + "%";
  bar.textContent = Math.round(percentage) + "%";
}