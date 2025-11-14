import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogService {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async create(createBlogDto: CreateBlogDto, authorId: string): Promise<Blog> {
    const readingTime = this.calculateReadingTime(createBlogDto.content);
    const blog = new this.blogModel({
      ...createBlogDto,
      author: new Types.ObjectId(authorId),
      readingTime,
      publishedAt: createBlogDto.status === 'published' ? new Date() : null,
    });
    return blog.save();
  }

  async findAll(query: {
    status?: string;
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = new Types.ObjectId(query.category);
    if (query.tag) filter.tags = new Types.ObjectId(query.tag);
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { excerpt: { $regex: query.search, $options: 'i' } },
        { content: { $regex: query.search, $options: 'i' } },
      ];
    }

    const blogs = await this.blogModel
      .find(filter)
      .populate('author', 'name email')
      .populate('tags', 'name slug')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.blogModel.countDocuments(filter).exec();

    return {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogModel
      .findById(id)
      .populate('author', 'name email')
      .populate('tags', 'name slug')
      .populate('category', 'name slug')
      .exec();

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    return blog;
  }

  async findBySlug(slug: string): Promise<Blog> {
    const blog = await this.blogModel
      .findOne({ slug, status: 'published' })
      .populate('author', 'name email')
      .populate('tags', 'name slug')
      .populate('category', 'name slug')
      .exec();

    if (!blog) {
      throw new NotFoundException(`Blog with slug ${slug} not found`);
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    if (updateBlogDto.content) {
      updateBlogDto.readingTime = this.calculateReadingTime(updateBlogDto.content);
    }

    if (updateBlogDto.status === 'published' && !updateBlogDto.publishedAt) {
      const existingBlog = await this.blogModel.findById(id);
      if (existingBlog && existingBlog.status !== 'published') {
        updateBlogDto.publishedAt = new Date();
      }
    }

    const blog = await this.blogModel
      .findByIdAndUpdate(id, updateBlogDto, { new: true })
      .populate('author', 'name email')
      .populate('tags', 'name slug')
      .populate('category', 'name slug')
      .exec();

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return blog;
  }

  async remove(id: string): Promise<void> {
    const result = await this.blogModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
  }

  async likeBlog(id: string, userId: string): Promise<Blog> {
    const blog = await this.blogModel.findById(id).exec();
    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    const userStr = userId.toString();
    const index = blog.likedBy.indexOf(userStr);

    if (index > -1) {
      // Unlike
      blog.likedBy.splice(index, 1);
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      // Like
      blog.likedBy.push(userStr);
      blog.likes += 1;
    }

    return blog.save();
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

