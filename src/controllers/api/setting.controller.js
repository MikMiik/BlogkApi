const settingService = require("@/services/setting.service");

exports.upsertSetting = async (req, res) => {
  const data = req.body;
  const setting = await settingService.upsertSetting(data);
  res.success(200, setting);
};

exports.getSetting = async (req, res) => {
  const setting = await settingService.getUserSettings();
  res.success(200, setting);
};

exports.getSettingByUserId = async (req, res) => {
  const { userId } = req.params;
  const setting = await settingService.getUserSettings(userId);
  res.success(200, setting);
};

exports.deleteSetting = async (req, res) => {
  const result = await settingService.deleteSetting();
  res.success(200, {
    message: "Settings deleted successfully",
    deleted: result,
  });
};
