import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/index.conf'

export interface AdminInfo {
    id?: string
    email: string
    fullName: string
    phone: string
    password: string
    role: string
}

export class Admin extends Model<AdminInfo> {
    id!: string
    email!: string
    fullName!: string
    phone!: string
    password!: string
    role!: string
}

Admin.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Admin',
    }
)
