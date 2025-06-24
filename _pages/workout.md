---
layout: page
title: "Daily Workout Routine"
permalink: /assets/workout-hub-42/
nav_exclude: true
sitemap: false
robots: noindex
---

<style>
/* Base styling */
body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

/* Headings */
h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

h2 {
  color: #34495e;
  margin: 2.5rem 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #3498db;
  font-size: 1.75rem;
}

/* Quick Calendar styling - Simple grey background like other sections */
h2:first-of-type {
  color: #3498db;
  border-bottom-color: #3498db;
  background: #f8f9fa;
  padding: 1rem 1.5rem 0.5rem 1.5rem;
  border-left: 5px solid #3498db;
  border-radius: 5px 5px 0 0;
  margin: 2rem 0 0 0;
}

h2:first-of-type + table {
  background: #f8f9fa;
  margin-top: 0;
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-left: 5px solid #3498db;
  border-radius: 0 0 5px 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2:first-of-type + table th {
  background: #e9ecef !important;
  color: #34495e !important;
  border-bottom-color: #dee2e6;
  font-weight: 600;
}

h2:first-of-type + table td {
  color: #34495e;
  border-bottom-color: #dee2e6;
  background: transparent;
}

/* Daily Activation styling */
h2:nth-of-type(2) {
  color: #28a745;
  border-bottom-color: #28a745;
  background: #f8f9fa;
  padding: 1rem 1.5rem 0.5rem 1.5rem;
  border-left: 5px solid #28a745;
  border-radius: 5px 5px 0 0;
  margin-bottom: 0;
}

h2:nth-of-type(2) + table {
  background: #f8f9fa;
  margin-top: 0;
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-left: 5px solid #28a745;
  border-radius: 0 0 5px 5px;
}

/* Day-specific styling with nth-of-type selectors */
h2:nth-of-type(3) { color: #e74c3c; border-bottom-color: #e74c3c; } /* Monday */
h2:nth-of-type(3) + table { border-left: 5px solid #e74c3c; }

h2:nth-of-type(4) { color: #f39c12; border-bottom-color: #f39c12; } /* Tuesday */
h2:nth-of-type(4) + table { border-left: 5px solid #f39c12; }

h2:nth-of-type(5) { color: #2ecc71; border-bottom-color: #2ecc71; } /* Wednesday */
h2:nth-of-type(5) + table { border-left: 5px solid #2ecc71; }

h2:nth-of-type(6) { color: #9b59b6; border-bottom-color: #9b59b6; } /* Thursday */
h2:nth-of-type(6) + table { border-left: 5px solid #9b59b6; }

h2:nth-of-type(7) { color: #3498db; border-bottom-color: #3498db; } /* Friday */
h2:nth-of-type(7) + table { border-left: 5px solid #3498db; }

h2:nth-of-type(8) { color: #e67e22; border-bottom-color: #e67e22; } /* Saturday */
h2:nth-of-type(8) + table { border-left: 5px solid #e67e22; }

h2:nth-of-type(9) { color: #1abc9c; border-bottom-color: #1abc9c; } /* Sunday */
h2:nth-of-type(9) + table { border-left: 5px solid #1abc9c; }

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 10px 12px;
  border-bottom: 1px solid #dee2e6;
}

tbody tr:nth-child(even) {
  background: #f8f9fa;
}

tbody tr:hover {
  background: #e3f2fd;
}

/* Override general table styling for Quick Calendar */
h2:first-of-type + table tbody tr:nth-child(even) {
  background: #f8f9fa;
}

h2:first-of-type + table tbody tr:hover {
  background: #e3f2fd;
}

/* Links */
a {
  color: #3498db;
  text-decoration: none;
}

a:hover {
  color: #2980b9;
  text-decoration: underline;
}

/* Glossary */
h2:last-of-type {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px 10px 0 0;
  margin: 3rem 0 0 0;
  border-bottom-color: #95a5a6;
}

h2:last-of-type ~ * {
  background: #f8f9fa;
  padding: 0 1.5rem;
  margin: 0;
}

h2:last-of-type ~ *:last-child {
  padding-bottom: 1.5rem;
  border-radius: 0 0 10px 10px;
}

h3 {
  color: #34495e;
  margin: 1.5rem 0 0.5rem 0;
  padding: 1rem;
  background: white;
  border-left: 4px solid #3498db;
  border-radius: 5px;
}

/* Responsive */
@media (max-width: 768px) {
  body {
    padding: 15px;
  }
  
  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  
  table { font-size: 0.9rem; }
  th, td { padding: 8px; }
  
  h2:first-of-type {
    padding: 1rem;
  }
  
  h2:first-of-type + table {
    padding: 0 1rem 1rem 1rem;
  }
  
  h2:nth-of-type(2),
  h2:nth-of-type(2) + table {
    padding: 1rem;
  }
}

.glossary-item{
  background:#ffffff;
  border:1px solid #dee2e6;
  border-radius:8px;
  box-shadow:0 2px 4px rgba(0,0,0,0.05);
  padding:1.25rem 1.5rem;
  margin:1rem 0;
}
.glossary-item h3{
  margin:0 0 0.5rem 0;
  font-size:1.2rem;
  color:#2c3e50;
  background:none;
  padding:0;
  border:none;
}
.glossary-item p{margin:0;line-height:1.5;}
</style>

## Quick-Look Calendar

| **Day** | **Theme** | **Duration** |
|---------|-----------|--------------|
| Monday | Glute + Hip Strength | 45 min |
| Tuesday | Upper Pull & Rotational Core | 40 min |
| Wednesday | Mobility / Activation | 25 min |
| Thursday | Power & Lateral Movement | 40 min |
| Friday | Upper Push + Posterior Chain | 45 min |
| Saturday | Agility + Conditioning | 35 min |
| Sunday | Long Mobility & Soft-Tissue | 25 min |

## 5-Minute Daily Activation (1–2 rounds)

| **Exercise** | **Reps** | **Notes** |
|--------------|----------|-----------|
| [Glute Bridge](#glute-bridge) → single-leg | 15–20 (or 10/leg) | Focus on glute engagement |
| [Side-Lying Band Abduction](#side-lying-band-abduction) | 15/side | Control the movement |
| [Standing Band Hip-Flexor March](#standing-band-hip-flexor-march) | 20 total | Keep torso tall |
| [Dead-Bug](#dead-bug) | 10 slow | Maintain flat back |

## Monday – Glute & Hip Strength

| **Exercise** | **Sets × Reps** | **Notes** |
|--------------|------------------|-----------|
| [Single-Leg Hip-Thrust](#single-leg-hip-thrust) | 3 × 10-12/leg | Add 15-lb DB on lap |
| [Bulgarian Split Squat](#bulgarian-split-squat) | 3 × 8-10/leg | Slight forward lean |
| [Banded Crab Walk](#banded-crab-walk) | 3 × 12 steps/side | Superset with Hip-Flexor March |
| [Standing Band Hip-Flexor March](#standing-band-hip-flexor-march) | 3 × 10/leg | Superset with Crab Walk |
| [Dead-Bug](#dead-bug) | 3 × 10 | Control the movement |
| 90-90 Hips & Hip-Flexor-to-Hamstring Stretch | 60 s/side | Deep stretch |

## Tuesday – Upper Pull & Core

| **Exercise** | **Sets × Reps** | **Notes** |
|--------------|------------------|-----------|
| Pull-Ups | 4 × max-1 | Leave 1 rep in tank |
| [Bent-Over DB Row](#bent-over-dumbbell-row) | 3 × 8-12 | Squeeze shoulder blades |
| EZ-Bar Curl | 3 × 10 | Control eccentric |
| [Band Face-Pull-Apart](#band-face-pull-apart) | 3 × 15 | External rotation focus |
| [Pallof Press](#pallof-press) | 3 × 12-15/side | Anti-rotation |
| [Tall-Kneel Band Wood-Chop](#standing-band-wood-chop) | 2 × 15/side | Core stability |

## Wednesday – Mobility / Recovery

| **Exercise** | **Duration/Reps** | **Notes** |
|--------------|-------------------|-----------|
| Hip CARs | 5/side | Full range of motion |
| [World's Greatest Stretch](#worlds-greatest-stretch) | 5/side | Dynamic movement |
| [Side-Plank Clamshell](#side-plank-clamshell) | 2 × 15/side | Glute med activation |
| [Bird-Dog](#bird-dog) | 2 × 12 | Opposite arm/leg |
| Figure-4 & Lumbar Twist | 60 s/side | Deep hip stretch |
| **Finish:** Daily Activation | 1 round | Light activation |

## Thursday – Power & Lateral Movement

| **Exercise** | **Sets × Reps** | **Notes** |
|--------------|------------------|-----------|
| [Kettlebell Swing](#kettlebell-swing) (62 lb) | 5 × 15 | Hip hinge power |
| [Lateral Goblet Lunge](#lateral-goblet-lunge) (25 lb) | 3 × 8-10/side | Sit back into hip |
| Reverse Lunge → Knee-Drive (15 lb) | 3 × 10/leg | Explosive knee drive |
| [Side-Plank with Top-Leg Abduction](#side-plank-clamshell) | 3 × 30 s/side | Stability + strength |
| Adductor Rock-Backs + 90-90 Flow | 2 rounds | Mobility flow |

## Friday – Upper Push & Posterior Chain

| **Exercise** | **Sets × Reps** | **Notes** |
|--------------|------------------|-----------|
| EZ-Bar Overhead Press | 4 × 6-8 | Vertical push strength |
| Push-Ups (feet elevated) | 3 × AMRAP | To technical failure |
| [Single-Arm DB RDL](#single-arm-db-rdl) | 3 × 10/leg | Balance + hamstring |
| Skull-Crusher | 3 × 10-12 | Tricep isolation |
| Band Reverse-Fly | 2 × 15 | Rear delt activation |
| Hollow-Body Leg Drop | 3 × 8-12 | Core stability |

## Saturday – Agility & Conditioning (Apt-Safe)

| **Drill** | **Work : Rest** | **Rounds** | **Notes** |
|-----------|-----------------|------------|-----------|
| [Band-Resisted Lateral Shuffle](#band-resisted-lateral-shuffle) | 20 s : 40 s | 6 | Stay low, fast feet |
| [KB Farmer Carry](#kettlebell-farmer-carry) (62 lb) | 30 m walk : 30 s | 4 | Upright posture |
| [Standing Band Wood-Chop](#standing-band-wood-chop) | 8/side → 30 s rest | 4 | Rotational power |
| Plank Walk-Out → Push-Up | 2 × 12 | Core + upper body |

## Sunday – Long Mobility Flow

| **Activity** | **Duration** | **Notes** |
|--------------|--------------|-----------|
| Yoga Flow | 20 min | Sun salutes, pigeon, deep lunges |
| Foam Rolling | 10 min | Calves, quads, IT-band, glutes |
| Light Band Pump | 5 min | Pull-aparts, OH triceps, curls (15 reps each) |

---

## Glossary / Exercise Guide

<div class="glossary">

<div id="glute-bridge" class="glossary-item">
  <h3>Glute Bridge</h3>
  <p>Hip-extension move targeting glute max and hamstrings. Press through heels, rib-cage down, avoid arching lower back. <a href="https://www.healthline.com/health/fitness-exercise/glute-bridge-variations">Detailed guide</a></p>
</div>

<div id="side-lying-band-abduction" class="glossary-item">
  <h3>Side-Lying Band Abduction</h3>
  <p>Lie on side, band around ankles; lift top leg slightly behind mid-line to hit glute med/min. <a href="https://www.youtube.com/watch?v=5wUk8wQNUT8">Video demo</a></p>
</div>

<div id="standing-band-hip-flexor-march" class="glossary-item">
  <h3>Standing Band Hip-Flexor March</h3>
  <p>Loop band under both feet; alternate high-knee drives keeping torso tall. Bonus: anti-rotation core engagement.</p>
</div>

<div id="dead-bug" class="glossary-item">
  <h3>Dead-Bug</h3>
  <p>Supine core drill — extend opposite arm & leg while lumbar stays flat. <a href="https://www.verywellfit.com/how-to-do-the-dead-bug-exercise-4685852">How-to guide</a></p>
</div>

<div id="single-leg-hip-thrust" class="glossary-item">
  <h3>Single-Leg Hip-Thrust</h3>
  <p>Upper back on couch, one foot planted. Drive hips until torso-thigh line is straight.</p>
</div>

<div id="bulgarian-split-squat" class="glossary-item">
  <h3>Bulgarian Split Squat</h3>
  <p>Rear foot on chair; descend until front thigh is parallel. <a href="https://www.acefitness.org">Form tips</a></p>
</div>

<div id="banded-crab-walk" class="glossary-item">
  <h3>Banded Crab Walk</h3>
  <p>Mini-band above knees; maintain athletic squat stance and step laterally.</p>
</div>

<div id="bent-over-dumbbell-row" class="glossary-item">
  <h3>Bent-Over Dumbbell Row</h3>
  <p>Hip hinge to ~45°, pull dumbbell to ribcage, pinch shoulder blades.</p>
</div>

<div id="band-face-pull-apart" class="glossary-item">
  <h3>Band Face-Pull-Apart</h3>
  <p>Anchor band at eye-height; pull to face with external-rotation emphasis.</p>
</div>

<div id="pallof-press" class="glossary-item">
  <h3>Pallof Press</h3>
  <p>Anchor band chest-height, press arms straight resisting rotation. <a href="https://www.youtube.com/watch?v=Te5VAYXy0wQ">Quick demo</a></p>
</div>

<div id="standing-band-wood-chop" class="glossary-item">
  <h3>Standing Band Wood-Chop</h3>
  <p>High-to-low diagonal press using anchored band. Apartment-friendly rotational power.</p>
</div>

<div id="kettlebell-swing" class="glossary-item">
  <h3>Kettlebell Swing</h3>
  <p>Hinge-driven hip snap — swing KB to chest height, arms relaxed. <a href="https://www.acefitness.org/resources/everyone/exercise-library/391/swing/">Step-by-step guide</a></p>
</div>

<div id="lateral-goblet-lunge" class="glossary-item">
  <h3>Lateral Goblet Lunge</h3>
  <p>Hold dumbbell at chest; step sideways, sit back into hip, keep trail leg straight.</p>
</div>

<div id="side-plank-clamshell" class="glossary-item">
  <h3>Side-Plank Clamshell</h3>
  <p>Side plank on forearm; top knee opens against band — great for glute med/min.</p>
</div>

<div id="single-arm-db-rdl" class="glossary-item">
  <h3>Single-Arm DB RDL</h3>
  <p>Hold dumbbell in opposite hand; hinge until stretch in hamstring, keep hips level. <a href="https://www.youtube.com/watch?v=47IZVhmhzOg">Video demo</a></p>
</div>

<div id="band-resisted-lateral-shuffle" class="glossary-item">
  <h3>Band-Resisted Lateral Shuffle</h3>
  <p>Loop long band around waist, anchor to door; shuffle sideways fast, stay low.</p>
</div>

<div id="kettlebell-farmer-carry" class="glossary-item">
  <h3>Kettlebell Farmer Carry</h3>
  <p>Walk holding KB at side, ribs down, shoulders level. Benefits: grip, core, posture. <a href="https://invictusfitness.com/blog/farmer-carries-super-beneficial-yet-widely-underused/">Article</a></p>
</div>

<div id="bird-dog" class="glossary-item">
  <h3>Bird-Dog</h3>
  <p>Quadruped; extend opposite arm & leg, keep hips square. <a href="https://www.youtube.com/watch?v=QQot16miua8">PT demo</a></p>
</div>

<div id="worlds-greatest-stretch" class="glossary-item">
  <h3>World's Greatest Stretch</h3>
  <p>Dynamic lunge-rotation combo hitting hips, T-spine, ankles. <a href="https://www.self.com/story/worlds-greatest-stretch-benefits">Overview</a></p>
</div>

</div>

*Last updated: {{ site.time | date: "%B %d, %Y" }}*