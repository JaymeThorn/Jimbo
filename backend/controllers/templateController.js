const WorkoutTemplate = require('../models/WorkoutTemplate');

exports.getTemplates = async (req, res) => {
  try {
    const templates = await WorkoutTemplate.find({ userId: req.userId });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { name, exercises } = req.body;
    const template = new WorkoutTemplate({ userId: req.userId, name, exercises });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    await WorkoutTemplate.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
