---
layout: page
title: "Daily Workout Routine"
permalink: /assets/workout-hub-42/   # ← pick your own secret slug
nav_exclude: true
sitemap: false
robots: noindex
---

<style>
/* Base Styling & Typography */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

.page__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Headings */
h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
}

h2 {
  color: #34495e;
  margin: 3rem 0 1.5rem 0;
  padding: 1rem 0 0.5rem 0;
  border-bottom: 3px solid #3498db;
  font-size: 1.75rem;
  font-weight: 600;
}

h3 {
  color: #2c3e50;
  margin: 2rem 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.875rem;
}

td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e0e6ed;
  vertical-align: top;
}

tbody tr:nth-child(even) {
  background: #f8f9fa;
}

tbody tr:hover {
  background: #e3f2fd;
  transition: background-color 0.3s ease;
}

/* Day-specific styling */
.day-monday { border-left: 5px solid #e74c3c; }
.day-tuesday { border-left: 5px solid #f39c12; }
.day-wednesday { border-left: 5px solid #2ecc71; }
.day-thursday { border-left: 5px solid #9b59b6; }
.day-friday { border-left: 5px solid #3498db; }
.day-saturday { border-left: 5px solid #e67e22; }
.day-sunday { border-left: 5px solid #1abc9c; }

/* Quick Calendar Styling */
.quick-calendar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.quick-calendar h2 {
  color: white;
  border-bottom: 3px solid rgba(255, 255, 255, 0.3);
  margin-top: 0;
}

.quick-calendar table {
  box-shadow: none;
  border-radius: 10px;
  overflow: hidden;
}

.quick-calendar thead {
  background: rgba(255, 255, 255, 0.2);
}

.quick-calendar tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.1);
}

.quick-calendar tbody tr:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Daily Activation Box */
.daily-activation {
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 15px;
  padding: 2rem;
  margin: 2rem 0;
  border-left: 6px solid #28a745;
}

.daily-activation h2 {
  color: #28a745;
  margin-top: 0;
  border-bottom-color: #28a745;
}

/* Exercise Links */
a[href^="#"] {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

a[href^="#"]:hover {
  color: #2980b9;
  text-decoration: underline;
}

/* Notes and Tips */
.notes {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid #f39c12;
}

/* Glossary Styling */
.glossary {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 2rem;
  margin: 3rem 0;
}

.glossary h2 {
  color: #2c3e50;
  border-bottom-color: #95a5a6;
  margin-top: 0;
}

.glossary h3 {
  color: #34495e;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.exercise-description {
  background: white;
  padding: 1.5rem;
  margin: 1rem 0;
  border-radius: 10px;
  border-left: 4px solid #3498db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page__content {
    padding: 0 15px;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
    margin: 2rem 0 1rem 0;
  }
  
  table {
    font-size: 0.875rem;
  }
  
  th, td {
    padding: 0.75rem 0.5rem;
  }
  
  .quick-calendar,
  .daily-activation,
  .glossary {
    padding: 1.5rem;
    margin: 1.5rem 0;
  }
  
  /* Stack table cells on very small screens */
  @media (max-width: 480px) {
    table, thead, tbody, th, td, tr {
      display: block;
    }
    
    thead tr {
      position: absolute;
      top: -9999px;
      left: -9999px;
    }
    
    tr {
      border: 1px solid #ccc;
      margin-bottom: 10px;
      border-radius: 8px;
      padding: 10px;
      background: white;
    }
    
    td {
      border: none;
      position: relative;
      padding: 10px 10px 10px 35%;
      text-align: left;
    }
    
    td:before {
      content: attr(data-label) ": ";
      position: absolute;
      left: 10px;
      width: 30%;
      font-weight: bold;
      color: #666;
    }
  }
}

/* Print Styles */
@media print {
  .page__content {
    max-width: none;
    padding: 0;
  }
  
  table {
    box-shadow: none;
    border: 1px solid #000;
  }
  
  .quick-calendar {
    background: none;
    color: black;
    border: 2px solid #000;
  }
}
</style>

<div class="quick-calendar">

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

</div>

<div class="daily-activation">

## 5-Minute Daily Activation (1–2 rounds)

| **Exercise** | **Reps** | **Notes** |
|--------------|----------|-----------|
| [Glute Bridge](#glute-bridge) → single-leg | 15–20 (or 10/leg) | Focus on glute engagement |
| [Side-Lying Band Abduction](#side-lying-band-abduction) | 15/side | Control the movement |
| [Standing Band Hip-Flexor March](#standing-band-hip-flexor-march) | 20 total | Keep torso tall |
| [Dead-Bug](#dead-bug) | 10 slow | Maintain flat back |

</div>

## Monday – Glute & Hip Strength
<div class="day-monday">

| **Exercise** | **Sets × Reps** | **Notes** |
|--------------|------------------|-----------|
| [Single-Leg Hip-Thrust](#single-leg-hip-thrust) | 3 × 10-12/leg | Add 15-lb DB on lap |
| [Bulgarian Split Squat](#bulgarian-split-squat) | 3 × 8-10/leg | Slight forward lean |
| [Banded Crab Walk](#banded-crab-walk) | 3 × 12 steps/side | Superset ▶ |
| [Standing Band Hip-Flexor March](#standing-band-hip-flexor-march) | 3 × 10/leg | ▶ |
| [Dead-Bug](#dead-bug) | 3 × 10 | Control the movement |
| 90-90 Hips & Hip-Flexor-to-Hamstring Stretch | 60 s/side | Deep stretch |

</div>

## Tuesday – Upper Pull & Core
<div class="day-tuesday">

| **Exercise** | **Sets × Reps** | **Notes** |
|--------------|------------------|-----------|
| Pull-Ups | 4 × max-1 | Leave 1 rep in tank |
| [Bent-Over DB Row](#bent-over-dumbbell-row) | 3 × 8-12 | Squeeze shoulder blades |
| EZ-Bar Curl | 3 × 10 | Control eccentric |
| [Band Face-Pull-Apart](#band-face-pull-apart) | 3 × 15 | External rotation focus |
| [Pallof Press](#pallof-press) | 3 × 12-15/side | Anti-rotation |
| [Tall-Kneel Band Wood-Chop](#standing-band-wood-chop) | 2 × 15/side | Core stability |

</div>

## Wednesday – Mobility / Recovery
<div class="day-wednesday">

| **Exercise** | **Duration/Reps** | **Notes** |
|--------------|-------------------|-----------|
| Hip CARs | 5/side | Full range of motion |
| [World's Greatest Stretch](#worlds-greatest-stretch) | 5/side | Dynamic movement |
| [Side-Plank Clamshell](#side-plank-clamshell) | 2 × 15/side | Glute med activation |
| [Bird-Dog](#bird-dog) | 2 × 12 | Opposite arm/leg |
| Figure-4 & Lumbar Twist | 60 s/side | Deep hip stretch |
| **Finish:** Daily Activation | 1 round | Light activation |

</div>

## Thursday – Power & Lateral Movement
<div class="day-thursday">

| **Exercise** | **Sets × Reps** | **Notes** |
|--------------|------------------|-----------|
| [Kettlebell Swing](#kettlebell-swing) (62 lb) | 5 × 15 | Hip hinge power |
| [Lateral Goblet Lunge](#lateral-goblet-lunge) (25 lb) | 3 × 8-10/side | Sit back into hip |
| Reverse Lunge → Knee-Drive (15 lb) | 3 × 10/leg | Explosive knee drive |
| [Side-Plank with Top-Leg Abduction](#side-plank-clamshell) | 3 × 30 s/side | Stability + strength |
| Adductor Rock-Backs + 90-90 Flow | 2 rounds | Mobility flow |

</div>

## Friday – Upper Push & Posterior Chain
<div class="day-friday">

| **Exercise** | **Sets × Reps** | **Notes** |
|--------------|------------------|-----------|
| EZ-Bar Overhead Press | 4 × 6-8 | Vertical push strength |
| Push-Ups (feet elevated) | 3 × AMRAP | To technical failure |
| [Single-Arm DB RDL](#single-arm-db-rdl) | 3 × 10/leg | Balance + hamstring |
| Skull-Crusher | 3 × 10-12 | Tricep isolation |
| Band Reverse-Fly | 2 × 15 | Rear delt activation |
| Hollow-Body Leg Drop | 3 × 8-12 | Core stability |

</div>

## Saturday – Agility & Conditioning (Apt-Safe)
<div class="day-saturday">

| **Drill** | **Work : Rest** | **Rounds** | **Notes** |
|-----------|-----------------|------------|-----------|
| [Band-Resisted Lateral Shuffle](#band-resisted-lateral-shuffle) | 20 s : 40 s | 6 | Stay low, fast feet |
| [KB Farmer Carry](#kettlebell-farmer-carry) (62 lb) | 30 m walk : 30 s | 4 | Upright posture |
| [Standing Band Wood-Chop](#standing-band-wood-chop) | 8/side → 30 s rest | 4 | Rotational power |
| Plank Walk-Out → Push-Up | 2 × 12 | Core + upper body |

</div>

## Sunday – Long Mobility Flow
<div class="day-sunday">

| **Activity** | **Duration** | **Notes** |
|--------------|--------------|-----------|
| Yoga Flow | 20 min | Sun salutes, pigeon, deep lunges |
| Foam Rolling | 10 min | Calves, quads, IT-band, glutes |
| Light Band Pump | 5 min | Pull-aparts, OH triceps, curls (15 reps each) |

</div>

---

<div class="glossary">

## Glossary / Exercise Guide

<div class="exercise-description">

### Glute Bridge {#glute-bridge}
Hip-extension move that targets glute max and hamstrings. Press through heels, rib-cage down, avoid arching lower back. Detailed guide: [Healthline](https://www.healthline.com/health/fitness-exercise/glute-bridge-variations).

</div>

<div class="exercise-description">

### Side-Lying Band Abduction {#side-lying-band-abduction}
Lie on side, band around ankles; lift top leg slightly behind mid-line to hit glute med/min. Video demo: [YouTube](https://www.youtube.com/watch?v=5wUk8wQNUT8).

</div>

<div class="exercise-description">

### Standing Band Hip-Flexor March {#standing-band-hip-flexor-march}
Loop band under both feet; alternate high-knee drives keeping torso tall. Anti-rotation core bonus.

</div>

<div class="exercise-description">

### Dead-Bug {#dead-bug}
Supine core drill—opposite arm/leg extend while lumbar stays flat. How-to: [Verywell Fit](https://www.verywellfit.com/how-to-do-the-dead-bug-exercise-4685852).

</div>

<div class="exercise-description">

### Single-Leg Hip-Thrust {#single-leg-hip-thrust}
Upper back on couch, one foot planted. Drive hips until torso-thigh line is straight.

</div>

<div class="exercise-description">

### Bulgarian Split Squat {#bulgarian-split-squat}
Rear foot on chair; descend until front thigh parallel. Form tips: [ACE](https://www.acefitness.org).

</div>

<div class="exercise-description">

### Banded Crab Walk {#banded-crab-walk}
Mini-band above knees; maintain squat stance and step laterally.

</div>

<div class="exercise-description">

### Bent-Over Dumbbell Row {#bent-over-dumbbell-row}
Hip hinge to ~45°, pull DB to ribcage, pinch shoulder blades.

</div>

<div class="exercise-description">

### Band Face-Pull-Apart {#band-face-pull-apart}
Anchor band eye-height; pull to face with external rotation emphasis.

</div>

<div class="exercise-description">

### Pallof Press {#pallof-press}
Anchor band chest-height, press arms straight resisting rotation. Quick demo: [YouTube](https://www.youtube.com/watch?v=Te5VAYXy0wQ).

</div>

<div class="exercise-description">

### Standing Band Wood-Chop {#standing-band-wood-chop}
High-to-low diagonal press using anchored band. Keeps rotational power apartment-friendly.

</div>

<div class="exercise-description">

### Kettlebell Swing {#kettlebell-swing}
Hinge-driven hip snap—KB to chest height, arms relaxed. Step-by-step: [ACE Exercise Library](https://www.acefitness.org/resources/everyone/exercise-library/391/swing/).

</div>

<div class="exercise-description">

### Lateral Goblet Lunge {#lateral-goblet-lunge}
Hold DB at chest; step sideways, sit back into hip, keep trail leg straight.

</div>

<div class="exercise-description">

### Side-Plank Clamshell {#side-plank-clamshell}
Side plank on forearm; top knee opens against band. Great for glute med/min.

</div>

<div class="exercise-description">

### Single-Arm DB RDL {#single-arm-db-rdl}
Hold DB in opposite hand; hinge until stretch in hamstring, keep hips level. Video: [YouTube](https://www.youtube.com/watch?v=47IZVhmhzOg).

</div>

<div class="exercise-description">

### Band-Resisted Lateral Shuffle {#band-resisted-lateral-shuffle}
Loop long band around waist, anchor to door; shuffle sideways fast, stay low.

</div>

<div class="exercise-description">

### Kettlebell Farmer Carry {#kettlebell-farmer-carry}
Walk holding KB at side, ribs down, shoulders level. Benefits: grip, core, posture. Article: [Invictus Fitness](https://invictusfitness.com/blog/farmer-carries-super-beneficial-yet-widely-underused/).

</div>

<div class="exercise-description">

### Bird-Dog {#bird-dog}
Quadruped; extend opposite arm & leg, keep hips square. PT demo: [YouTube](https://www.youtube.com/watch?v=QQot16miua8).

</div>

<div class="exercise-description">

### World's Greatest Stretch {#worlds-greatest-stretch}
Dynamic lunge-rotation combo hitting hips, T-spine, ankles. Overview: [SELF](https://www.self.com/story/worlds-greatest-stretch-benefits).

</div>

</div>

*Last updated: {{ site.time | date: "%B %d, %Y" }}*