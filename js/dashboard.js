document.addEventListener("DOMContentLoaded", function () { 
 
 console.log("SAFE LOAD ✅"); 
 console.log("PAGE:", window.location.pathname); 
 
 // ========================= 
 // EXAM MODAL 
 // ========================= 
 const examModal = document.getElementById("examModal"); 
 const examSelect = document.getElementById("examSemester"); 
 const examView = document.getElementById("examViewBtn"); 
 const examCancel = document.getElementById("examCancelBtn"); 
 
 if (examModal && examSelect && examView && examCancel) { 
 
     console.log("Exam Modal Ready ✅"); 
 
     examModal.style.display = "flex"; 
 
     examSelect.addEventListener("change", function () { 
         if (this.value !== "") { 
             examView.style.display = "inline-block"; 
         } else { 
             examView.style.display = "none"; 
         } 
     }); 
 
     examView.onclick = function () { 
         const val = examSelect.value; 
         if (!val) return; 
 
         const path = `../assets/examinationResult/${val}.pdf`;
         console.log("Opening:", path);
         window.open(path, "_blank"); 
     }; 
 
     examCancel.onclick = function () { 
         examModal.style.display = "none"; 
     }; 
 } 
 
 // ========================= 
 // COURSE MODAL 
 // ========================= 
 const courseModal = document.getElementById("courseModal"); 
 const courseSelect = document.getElementById("courseSemester"); 
 const courseView = document.getElementById("courseViewBtn"); 
 const courseCancel = document.getElementById("courseCancelBtn"); 
 
 if (courseModal && courseSelect && courseView && courseCancel) { 
 
     console.log("Course Modal Ready ✅"); 
 
     courseModal.style.display = "flex"; 
 
     courseView.onclick = function () { 
         const val = courseSelect.value; 
         if (!val) return; 
 
         window.open(`../assets/courseRegistrationSlipUg_pdf/${val}.pdf`, "_blank"); 
     }; 
 
     courseCancel.onclick = function () { 
         courseModal.style.display = "none"; 
     }; 
 } 
 
 // ========================= 
 // CHART FIX 
 // ========================= 
 if (typeof Highcharts !== "undefined") { 
     const container = document.getElementById("chartContainer"); 
 
     if (container) { 
         Highcharts.chart('chartContainer', { 
             chart: { type: 'line' }, 
             title: { text: 'CGPA Summary' }, 
             xAxis: { 
                 categories: ['202420251', '202420252', '202520261'] 
             }, 
             series: [{ 
                 name: 'Semester', 
                 data: [2.5, 2.5, 2.29] 
             }] 
         }); 
 
         console.log("Chart Loaded ✅"); 
     } 
 } 
 
 }); 
