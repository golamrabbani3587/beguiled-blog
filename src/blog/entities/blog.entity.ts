import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/entities/user.entity';
import { Tag } from '../../tag/entities/tag.entity';
import { Category } from '../../category/entities/category.entity';

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type BlogDocument = Blog & Document;

@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true, type: String })
  content: string; // Rich HTML content from editor

  @Prop()
  excerpt: string;

  @Prop()
  featuredImage: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Tag' }], default: [] })
  tags: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({
    type: String,
    enum: BlogStatus,
    default: BlogStatus.DRAFT,
  })
  status: BlogStatus;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [String], default: [] })
  likedBy: string[]; // Array of user IDs who liked

  @Prop({ default: false })
  featured: boolean;

  @Prop()
  publishedAt: Date;

  @Prop({ default: 0 })
  readingTime: number; // in minutes
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

// Create indexes
BlogSchema.index({ slug: 1 }, { unique: true });
BlogSchema.index({ status: 1 });
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ category: 1 });

