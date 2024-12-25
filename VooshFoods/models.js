const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql', // Use 'mysql' for MySQL database
  logging: false, // Disable logging
});

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Viewer' },
}, {
  timestamps: false,
  tableName: 'users',
});

const Artist = sequelize.define('Artist', {
  artist_id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  grammy: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: false,
  tableName: 'artists',
});

const Album = sequelize.define('Album', {
  album_id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  artist_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'artists',
      key: 'artist_id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: false,
  tableName: 'albums',
});

const Track = sequelize.define('Track', {
  track_id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  album_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'albums',
      key: 'album_id',
    },
  },
}, {
  timestamps: false,
  tableName: 'tracks',
});

const Favorite = sequelize.define('Favorite', {
  favorite_id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  category: {
    type: DataTypes.ENUM('artist', 'album', 'track'),
    allowNull: false,
  },
  item_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
  },
  artist_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  album_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  track_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
  tableName: 'favorites',
});

// Define associations
Artist.hasMany(Album, { foreignKey: 'artist_id', as: 'albums' });
Album.belongsTo(Artist, { foreignKey: 'artist_id', as: 'artist' });
Album.hasMany(Track, { foreignKey: 'album_id', as: 'tracks' });
Track.belongsTo(Album, { foreignKey: 'album_id', as: 'album' });
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

sequelize.sync();

module.exports = {
  sequelize,
  User,
  Artist,
  Album,
  Track,
  Favorite,
};
