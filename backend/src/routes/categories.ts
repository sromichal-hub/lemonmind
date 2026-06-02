import { Router } from 'express';
import prisma from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      include: { children: true, products: true },
      orderBy: { createdAt: 'asc' },
    });

    const buildTree = (categories: any[], parentId: number | null = null) => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          ...cat,
          children: buildTree(categories, cat.id),
        }));
    };

    const tree = buildTree(categories);
    res.json(tree);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    let parentCategory = null;
    if (parentId) {
      parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory || parentCategory.userId !== req.user.id) {
        return res
          .status(403)
          .json({ error: 'Parent category not found or not yours' });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        userId: req.user.id,
        parentId: parentId || null,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { name, parentId } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category || category.userId !== req.user.id) {
      return res.status(403).json({ error: 'Category not found or not yours' });
    }

    if (parentId && parentId === parseInt(id)) {
      return res
        .status(400)
        .json({ error: 'Cannot set category as its own parent' });
    }

    const updated = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: name || category.name,
        parentId: parentId !== undefined ? parentId : category.parentId,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
    });

    if (!category || category.userId !== req.user.id) {
      return res.status(403).json({ error: 'Category not found or not yours' });
    }

    // Delete all descendants recursively
    const deleteDescendants = async (parentId: number) => {
      const children = await prisma.category.findMany({
        where: { parentId },
      });

      for (const child of children) {
        await deleteDescendants(child.id);
      }

      await prisma.category.deleteMany({
        where: { parentId },
      });
    };

    await deleteDescendants(parseInt(id));
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
