---
layout: archive
permalink: /movies/
title: "Movies"
author_profile: true
header:
  overlay_image: marbled_5.jpg
---
{% include base_path %}

You can find many of my movies <u><a href="https://vimeo.com/user104775348">here</a>.</u> 

### Radiative Turbulent Mixing Layers

Here are some movies of my radiative turbulent mixing layers that will be published shortly!

Rapidly cooling simulation
{% include video id="397632983" provider="vimeo" %}

Here is a visualization of the fractal surface where cooling takes place in a rapid cooling simulations
{% include video id="398055547" provider="vimeo" %}

Mildly cooling simulation
{% include video id="397632971" provider="vimeo" %}

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