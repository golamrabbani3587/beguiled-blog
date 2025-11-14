import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  blogCount: number;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

TagSchema.index({ slug: 1 }, { unique: true });
TagSchema.index({ name: 1 });

