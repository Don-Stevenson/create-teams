import mongoose from 'mongoose'

const PlayerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    attackScore: {
      type: Number,
      required: [true, 'Please add an attack score'],
      min: [0, 'Attack score must be at least 0'],
      max: [50, 'Attack score cannot be more than 50'],
    },
    defenseScore: {
      type: Number,
      required: [true, 'Please add a defense score'],
      min: [0, 'Defense score must be at least 0'],
      max: [50, 'Defense score cannot be more than 50'],
    },
    fitnessScore: {
      type: Number,
      required: [true, 'Please add a fitness score'],
      min: [0, 'Fitness score must be at least 0'],
      max: [50, 'Fitness score cannot be more than 50'],
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

export default mongoose.model('Player', PlayerSchema)
