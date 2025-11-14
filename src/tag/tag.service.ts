import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<TagDocument>) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = new this.tagModel(createTagDto);
    return tag.save();
  }

  async findAll(): Promise<Tag[]> {
    return this.tagModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagModel.findById(id).exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagModel
      .findByIdAndUpdate(id, updateTagDto, { new: true })
      .exec();
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tagModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
  }

  // Initialize medical tags
  async initializeMedicalTags() {
    const medicalTags = [
      { name: 'Cardiology', slug: 'cardiology', description: 'Heart and cardiovascular health' },
      { name: 'Oncology', slug: 'oncology', description: 'Cancer treatment and research' },
      { name: 'Neurology', slug: 'neurology', description: 'Brain and nervous system disorders' },
      { name: 'Pediatrics', slug: 'pediatrics', description: 'Children\'s health and medicine' },
      { name: 'Dermatology', slug: 'dermatology', description: 'Skin conditions and treatments' },
      { name: 'Orthopedics', slug: 'orthopedics', description: 'Bones, joints, and muscles' },
      { name: 'Endocrinology', slug: 'endocrinology', description: 'Hormones and metabolic disorders' },
      { name: 'Gastroenterology', slug: 'gastroenterology', description: 'Digestive system health' },
      { name: 'Psychiatry', slug: 'psychiatry', description: 'Mental health and psychological disorders' },
      { name: 'Radiology', slug: 'radiology', description: 'Medical imaging and diagnostics' },
      { name: 'Surgery', slug: 'surgery', description: 'Surgical procedures and techniques' },
      { name: 'Preventive Medicine', slug: 'preventive-medicine', description: 'Disease prevention and wellness' },
      { name: 'Public Health', slug: 'public-health', description: 'Community health and epidemiology' },
      { name: 'Pharmacology', slug: 'pharmacology', description: 'Drugs and medications' },
      { name: 'Pathology', slug: 'pathology', description: 'Disease causes and effects' },
    ];

    for (const tagData of medicalTags) {
      const existingTag = await this.tagModel.findOne({ slug: tagData.slug }).exec();
      if (!existingTag) {
        await this.create(tagData);
      }
    }
  }
}

