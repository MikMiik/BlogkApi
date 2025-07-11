const getExcerptFromContent = (content, numSentences = 2) => {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, numSentences).join(" ").trim();
};

module.exports = getExcerptFromContent;
