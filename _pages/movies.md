---
layout: archive
permalink: /movies/
title: "Movies"
author_profile: true
header:
  overlay_image: marbled_5.jpg
---
{% include base_path %}

### Radiative Kelvin Helmholtz

Here is a movie of my radiative turbulent mixing layers that will be published shortly!
{% include video id="370896076" provider="vimeo" %}

### Clustered SNe Driving Galactic Winds

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