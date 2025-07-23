const { Topic, PostTopic } = require("@/models");

async function handlePostTopic({ postId, topicNames }) {
  const uniqueNames = [...new Set(topicNames.map((name) => name.trim()))];

  const existingTopics = await Topic.findAll({
    where: {
      name: uniqueNames,
    },
  });

  const existingNames = existingTopics.map((t) => t.name);
  const existingIds = existingTopics.map((t) => t.id);

  // Tìm các topic chưa tồn tại
  const missingNames = uniqueNames.filter(
    (name) => !existingNames.includes(name)
  );

  // Tạo mới các topic còn thiếu
  const newTopics = await Promise.all(
    missingNames.map((name) => Topic.create({ name }))
  );

  const newIds = newTopics.map((t) => t.id);

  // Tổng hợp tất cả topicId
  const allTopicIds = [...existingIds, ...newIds];

  // Tạo các bản ghi trong bảng PostTopic
  const postTopicEntries = allTopicIds.map((topicId) => ({
    postId,
    topicId,
  }));

  await PostTopic.bulkCreate(postTopicEntries);
}

module.exports = handlePostTopic;
