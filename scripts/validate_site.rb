#!/usr/bin/env ruby
# frozen_string_literal: true

require 'pathname'

ROOT = Pathname(__dir__).join('..').realpath
SOURCE_FILES = Dir[
  ROOT.join('*.html').to_s,
  ROOT.join('wagers/*.html').to_s,
  ROOT.join('solfege-flight/*.html').to_s
].sort.freeze
PUBLISHED_DOCS = %w[
  ANALYTICS_QUICKSTART.html
  ANALYTICS_QUICKSTART.md
  ANALYTICS_SETUP.html
  ANALYTICS_SETUP.md
  solfege-flight/README.html
].freeze
EXPECTED_OUTPUTS = %w[
  assets/css/new-style.css
  assets/js/site.js
].freeze
SKIP_PREFIXES = %w[http:// https:// mailto: tel: javascript: #].freeze
ASSET_PREFIXES = %w[/assets/ /files/ /images/ /favicon.svg].freeze

def skip_url?(url)
  url.include?('{{') || url.include?('{%') || SKIP_PREFIXES.any? { |prefix| url.start_with?(prefix) }
end

def route_like?(url)
  url.start_with?('/') && !ASSET_PREFIXES.any? { |prefix| url.start_with?(prefix) } && File.extname(url).empty?
end

def normalize_path(file_path, raw_url)
  return nil if raw_url.nil? || raw_url.empty? || skip_url?(raw_url) || route_like?(raw_url)

  if raw_url.start_with?('/')
    ROOT.join(raw_url.delete_prefix('/'))
  else
    file_path.dirname.join(raw_url).cleanpath
  end
end

missing = []

SOURCE_FILES.each do |file_name|
  file_path = Pathname(file_name)
  content = file_path.read
  matches = content.scan(/(?:href|src)=["']\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}["']|(?:href|src)=["']([^"']+)["']/)

  matches.each do |liquid_url, literal_url|
    raw_url = liquid_url || literal_url
    target = normalize_path(file_path, raw_url)
    next unless target

    missing << "#{file_path.relative_path_from(ROOT)} -> #{raw_url}" unless target.exist?
  end
end

published_docs = PUBLISHED_DOCS.select { |path| ROOT.join('_site', path).exist? }
missing_outputs = EXPECTED_OUTPUTS.reject { |path| ROOT.join('_site', path).exist? }

if missing.any? || published_docs.any? || missing_outputs.any?
  warn 'Site validation failed.'
  missing.each { |entry| warn "Missing local reference: #{entry}" }
  published_docs.each { |entry| warn "Unexpected published internal doc: _site/#{entry}" }
  missing_outputs.each { |entry| warn "Missing expected built asset: _site/#{entry}" }
  exit 1
end

puts 'Site validation passed.'
