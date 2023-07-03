import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../config/index.conf'

export class Message extends Model {
    id!: string
    message!: string
    senderId!: string
    recipientId!: string
}

Message.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        senderId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        recipientId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'Message',
    }
)

export interface UserInfo {
    id?: string
    email: string
    fullName: string
    phone: string
    password: string
    otp?: number | null
    expiry?: Date | null
    status?: string
    specialty?: string
    role: string
    avatar?: string
    adminId?: string
    CV?: any
}

export class User extends Model<UserInfo> {
    id!: string
    email!: string
    fullName!: string
    phone!: string
    password!: string
    otp!: number | null
    expiry!: Date | null
    status!: string
    specialty!: string
    role!: string
    avatar!: string | undefined
    adminId!: string | undefined
    CV!: any
}

User.init(
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
        otp: {
            type: DataTypes.INTEGER,
        },
        CV: { type: DataTypes.BLOB, allowNull: true },
        expiry: {
            type: DataTypes.DATE,
        },
        status: {
            type: DataTypes.STRING,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        specialty: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        adminId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
    }
)

User.hasMany(Message, {
    foreignKey: 'senderId',
    as: 'Messages',
    constraints: false,
})

Message.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'User',
    constraints: false,
})