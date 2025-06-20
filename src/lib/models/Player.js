import mongoose from 'mongoose'

const PlayerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    gameKnowledgeScore: {
      type: Number,
      required: [true, 'Please add a Game Knowledge score'],
      min: [1, 'score must be at least 1'],
      max: [10, 'score cannot be more than 10'],
    },
    goalScoringScore: {
      type: Number,
      required: [true, 'Please add a Goal Scoring score'],
      min: [1, 'score must be at least 1'],
      max: [10, 'score cannot be more than 10'],
    },
    attackScore: {
      type: Number,
      required: [true, 'Please add an attack score'],
      min: [1, 'score must be at least 1'],
      max: [10, 'score cannot be more than 10'],
    },
    midfieldScore: {
      type: Number,
      required: [true, 'Please add an midfield score'],
      min: [1, 'score must be at least 1'],
      max: [10, 'score cannot be more than 10'],
    },
    defenseScore: {
      type: Number,
      required: [true, 'Please add a defense score'],
      min: [1, 'score must be at least 1'],
      max: [10, 'score cannot be more than 10'],
    },
    fitnessScore: {
      type: Number,
      required: [true, 'Please add a Mobility/stamina score'],
      min: [1, 'score must be at least 1'],
      max: [10, 'score cannot be more than 10'],
    },
    gender: {
      type: String,
      required: [true, 'Please specify gender'],
      enum: ['male', 'female', 'nonBinary'],
    },
    isPlayingThisWeek: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Player || mongoose.model('Player', PlayerSchema)
