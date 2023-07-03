import { DataTypes, Model } from 'sequelize'
import { sequelize } from "../config/index.conf"

export interface ArticleInfo {
    articleId: string
    articleTitle: string
    headerImage: string
    cloudinary_id: string
    articleBody: string
}

export class Article extends Model<ArticleInfo> {
    articleId!: string
    articleTitle!: string
    headerImage!: string
    cloudinary_id!: string
    articleBody!: string
}


Article.init(
    {
        articleId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        articleTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        headerImage: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cloudinary_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        articleBody: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Articles',
    }
)