---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

A pdf version of my CV can be found [here](http://dfielding14.github.io/files/DBF_CV.pdf), which was last updated 1 Nov 2019.

Education
======
* Ph.D in Astrophysics, University of California, Berkeley, [2018]{style="float:right"}
  * Advisor: Eliot Quataert
  * Thesis: Interplay of Galactic Winds and Circumgalactic Media
* M.S. in Astrophysics, University of California, Berkeley, [2014]{style="float:right"}
* B.A. in Physics, Johns Hopkins University, [2012]{style="float:right"}
* B.A. in Math, Johns Hopkins University, [2012]{style="float:right"}


Work experience
======
* Flatiron Research Fellow, Post-doc, Center for Computational Astrophysics, Flatiron Institute, Simons Foundation [since 2018]{style="float:right"}
  * Collaborators: Greg Bryan, Eve Ostriker, Jonathan Stern, Rachel Somerville, Claude-Andre Faucher-Giguere, Eliot Quataert, Stephanie Tonnenson, Iryna Butsky, Viraj Pandya, Miao Li, Kung-Yi Su, Adam Jermyn, and more.
* Visiting Researcher IISc with Prateek Sharma [2016]{style="float:right"}
* NSF Graduate Research Fellow [2014-2017]{style="float:right"}
* Berkeley Fellow for Graduate Study [2012-2014]{style="float:right"}


Publications
======
A full list of publications can be found [here](https://ui.adsabs.harvard.edu/user/libraries/xhnvsk6JRsC7Ljzg8ToqVQ).

### First Author
{% for post in site.publications reversed %}
    {% if post.authorrank == "first" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}

### Second Author
{% for post in site.publications reversed %}
    {% if post.authorrank == "second" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}


### N-th Author
{% for post in site.publications reversed %}
    {% if post.authorrank == "nth" %}
      {% include archive-single.html %}
    {% endif %}
{% endfor %}


Talks
======
  <ul>{% for post in site.talks %}
    {% include archive-single-talk-cv.html %}
  {% endfor %}</ul>
  
Teaching
======
  <ul>{% for post in site.teaching %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
  
Service and leadership
======
* Graduate student mentor for the Flatiron Pre-Doctoral Program (Iryna Butsky) 2019
* Referee: ApJ, ApJL, MNRAS since 2016
* Graduate Student Instructor: Astro C12, Astro 7A

Science 
