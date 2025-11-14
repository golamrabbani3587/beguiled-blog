import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }

  // Initialize medical categories
  async initializeMedicalCategories() {
    const medicalCategories = [
      { name: 'Clinical Medicine', slug: 'clinical-medicine', description: 'Practical medical care and patient treatment', icon: '🏥' },
      { name: 'Medical Research', slug: 'medical-research', description: 'Latest medical studies and discoveries', icon: '🔬' },
      { name: 'Healthcare Policy', slug: 'healthcare-policy', description: 'Healthcare systems and regulations', icon: '📋' },
      { name: 'Medical Education', slug: 'medical-education', description: 'Medical training and professional development', icon: '🎓' },
      { name: 'Wellness & Prevention', slug: 'wellness-prevention', description: 'Health promotion and disease prevention', icon: '💚' },
      { name: 'Patient Stories', slug: 'patient-stories', description: 'Real patient experiences and case studies', icon: '📖' },
    ];

    for (const catData of medicalCategories) {
      const existingCategory = await this.categoryModel.findOne({ slug: catData.slug }).exec();
      if (!existingCategory) {
        await this.create(catData);
      }
    }
  }
}

