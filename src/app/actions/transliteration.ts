"use server";

export async function suggestHindiTransliteration(
  englishText: string,
): Promise {
  if (!englishText || !englishText.trim()) return "";

  try {
    const words = englishText.trim().split(/\s+/);
    let translatedWords = [];

    for (const word of words) {
      const response = await fetch(
        `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=hi-t-i0-und&num=1`,
        { next: { revalidate: 3600 } },
      );

      const data = await response.json();
      if (data[0] === "SUCCESS" && data[1] && data[1][0] && data[1][0][1]) {
        translatedWords.push(data[1][0][1][0]);
      } else {
        translatedWords.push(word);
      }
    }
    return translatedWords.join(" ");
  } catch (error) {
    return "";
  }
}
