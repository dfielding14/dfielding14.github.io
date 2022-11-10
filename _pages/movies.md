---
layout: archive
permalink: /movies/
title: "Visualizations"
author_profile: true
header:
  overlay_image: marbled_5.jpg
---
{% include base_path %}

You can find many of my movies <u><a href="https://vimeo.com/user104775348">here</a></u> and <u><a href="https://www.youtube.com/channel/UCVBtjNpelIuhdwarTfSQtow">here</a>.</u>


## Plasmoid Instability
Rotating volume rendering of the temperature field of a patch of the turbulent, thermally unstable, magnetized interstellar medium. Blue is cold (10 K), yellow/orange is warm (10,000 K), and some magnetic field lines are shown as white tubes.
{% include video id="a9D70gIAOoU" provider="youtube" %}

A different rotating volume rendering of the temperature field of a patch of the turbulent, thermally unstable, magnetized interstellar medium. Blue is cold (10 K), yellow/orange is warm (10,000 K), and some magnetic field lines are shown as purple tubes. This is figure 1 of the corresponding paper. The orange, green, and blue boxes are subvolumes that are shown in the following movies.
{% include video id="mkP_gk_pcHQ" provider="youtube" %}
{% include video id="TyM1KWHR3Tc" provider="youtube" %}
{% include video id="ZP4gp84IXmU" provider="youtube" %}
{% include video id="DVcEmi10ap0" provider="youtube" %}

Step through along y axis of 3D Resistive MHD simulation of a turbulent thermally unstable medium. The left panel shows the electric current, the middle shows plasma beta, and the right shows the temperature. This is figure 2 of the corresponding paper.
{% include video id="CBT-VLfoBiI" provider="youtube" %}

Step through along z axis of 3D Resistive MHD simulation of a turbulent thermally unstable medium
{% include video id="lm0DQqdLVVs" provider="youtube" %}

Here is a movie of Plasmoids forming in 2.5D simulations of high-$\beta$ systems!
Zoom in
{% include video id="482820624" provider="vimeo" %}

## Radiative Turbulent Mixing Layers

Here are some movies of my radiative turbulent mixing layers!

Volume rendering of a mixing layer. Color shows the turbulent velocity and the opacity follows temperature, with hot transparent and cold opaque.
{% include video id="zmNq5tjuF88" provider="youtube" %}

Rapidly cooling simulation
{% include video id="397632983" provider="vimeo" %}

Here is a visualization of the fractal surface where cooling takes place in a rapid cooling simulations
{% include video id="398055547" provider="vimeo" %}
{% include video id="380596739" provider="vimeo" %}


## Clustered SNe Driving Galactic Winds

Here is a movie of clustered SNe driving a galactic wind!
{% include video id="371403722" provider="vimeo" %}


<!-- 
{% include base_path %}
{% capture written_year %}'None'{% endcapture %}
{% for post in site.posts %}
  {% capture year %}{{ post.date | date: '%Y' }}{% endcapture %}
  {% if year != written_year %}
    <h2 id="{{ year | slugify }}" class="archive__subtitle">{{ year }}</h2>
    {% capture written_year %}{{ year }}{% endcapture %}
  {% endif %}
  {% include archive-single.html %}
{% endfor %}
 -->