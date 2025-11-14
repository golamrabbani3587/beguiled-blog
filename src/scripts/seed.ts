import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { TagService } from '../tag/tag.service';
import { CategoryService } from '../category/category.service';
import { UserRole } from '../user/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const tagService = app.get(TagService);
  const categoryService = app.get(CategoryService);

  try {
    // Create admin user
    const adminEmail = 'admin@begelled.com';
    const existingAdmin = await userService.findByEmail(adminEmail);
    
    if (!existingAdmin) {
      await userService.create({
        email: adminEmail,
        password: 'admin123',
        name: 'Admin User',
        role: UserRole.ADMIN,
      });
      console.log('✅ Admin user created: admin@begelled.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Initialize medical tags
    await tagService.initializeMedicalTags();
    console.log('✅ Medical tags initialized');

    // Initialize medical categories
    await categoryService.initializeMedicalCategories();
    console.log('✅ Medical categories initialized');

    console.log('\n🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();

