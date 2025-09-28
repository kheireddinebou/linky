import axios from "axios";
import * as cheerio from "cheerio";

export interface TitleExtractionResult {
  suggestions: string[];
  source: "cache" | "webpage" | "fallback";
}

export class TitleSuggestionsService {
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static readonly MAX_SUGGESTIONS = 6;
  private static readonly REQUEST_TIMEOUT = 10000;

  static async extractTitleSuggestions(url: string): Promise<string[]> {
    try {
      const response = await axios.get(url, {
        timeout: this.REQUEST_TIMEOUT,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        maxRedirects: 5,
      });

      return this.parseHtmlForTitles(response.data, url);
    } catch (error) {
      console.error("Error fetching webpage:", error);
      return this.generateFallbackTitles(url);
    }
  }

  private static parseHtmlForTitles(html: string, url: string): string[] {
    const $ = cheerio.load(html);
    const titleCandidates: string[] = [];

    // Extract title candidates from various sources
    this.extractPageTitle($, titleCandidates);
    this.extractMetaTitles($, titleCandidates);
    this.extractHeadings($, titleCandidates);
    this.extractMetaDescription($, titleCandidates);
    this.addDomainBasedTitle(url, $, titleCandidates);

    return this.cleanAndDeduplicateTitles(titleCandidates);
  }

  private static extractPageTitle(
    $: cheerio.CheerioAPI,
    candidates: string[]
  ): void {
    const pageTitle = $("title").text().trim();
    if (pageTitle) {
      candidates.push(pageTitle);
    }
  }

  private static extractMetaTitles(
    $: cheerio.CheerioAPI,
    candidates: string[]
  ): void {
    // Open Graph title
    const ogTitle = $('meta[property="og:title"]').attr("content");
    if (ogTitle?.trim()) {
      candidates.push(ogTitle.trim());
    }

    // Twitter title
    const twitterTitle = $('meta[name="twitter:title"]').attr("content");
    if (twitterTitle?.trim()) {
      candidates.push(twitterTitle.trim());
    }
  }

  private static extractHeadings(
    $: cheerio.CheerioAPI,
    candidates: string[]
  ): void {
    $("h1").each((i, el) => {
      if (i < 3) {
        // Limit to first 3 H1s
        const h1Text = $(el).text().trim();
        if (h1Text && h1Text.length > 0 && h1Text.length <= 100) {
          candidates.push(h1Text);
        }
      }
    });
  }

  private static extractMetaDescription(
    $: cheerio.CheerioAPI,
    candidates: string[]
  ): void {
    const metaDescription = $('meta[name="description"]').attr("content");
    if (metaDescription?.trim()) {
      const shortened = metaDescription.trim().substring(0, 60);
      candidates.push(shortened + (metaDescription.length > 60 ? "..." : ""));
    }
  }

  private static addDomainBasedTitle(
    url: string,
    $: cheerio.CheerioAPI,
    candidates: string[]
  ): void {
    try {
      const urlObj = new URL(url);
      const pageTitle = $("title").text().trim();
      const domainTitle =
        urlObj.hostname.replace("www.", "") +
        " - " +
        (pageTitle ? pageTitle.split(" ").slice(0, 4).join(" ") : "Link");
      candidates.push(domainTitle);
    } catch (error) {
      console.error("Error generating domain-based title:", error);
    }
  }

  private static cleanAndDeduplicateTitles(candidates: string[]): string[] {
    const cleaned = Array.from(
      new Set(
        candidates
          .filter(title => title && title.length > 0)
          .map(
            title =>
              title
                .replace(/\s+/g, " ") // Normalize whitespace
                .trim()
                .substring(0, 100) // Limit length
          )
          .filter(title => title.length >= 3) // Minimum length
      )
    ).slice(0, this.MAX_SUGGESTIONS);

    // Add fallback if no good suggestions found
    if (cleaned.length === 0) {
      cleaned.push("Untitled Link");
    }

    return cleaned;
  }

  static generateFallbackTitles(url: string): string[] {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace("www.", "");
      const pathname = urlObj.pathname.split("/").pop() || "Page";

      return [
        hostname,
        `Link from ${hostname}`,
        `${hostname} - ${pathname}`,
        "Saved Link",
      ];
    } catch {
      return ["Untitled Link", "Saved Link"];
    }
  }

  static generateCacheKey(url: string): string {
    return `title_suggestions:${Buffer.from(url).toString("base64")}`;
  }

  static getCacheTTL(): number {
    return this.CACHE_TTL;
  }
}
