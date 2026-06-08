import { Router, Response } from 'express';
import prisma from '../db';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET all products for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const products = await prisma.product.findMany({
      where: { userId: req.user.id },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET product by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product || product.userId !== req.user.id) {
      return res.status(403).json({ error: 'Product not found or not yours' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// CREATE product
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      name,
      categoryId,
      gpsrIdentificationDetails,
      gpsrWarningPhrases,
      gpsrWarningText,
      gpsrPictograms,
      gpsrAdditionalSafetyInfo,
      gpsrStatementOfCompliance,
      gpsrOnlineInstructionsUrl,
      gpsrInstructionsManual,
      gpsrDeclarationsOfConformity,
      gpsrCertificates,
      gpsrModerationStatus,
      gpsrModerationComment,
      gpsrSubmittedBySupplierUser,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    // Verify category belongs to user if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ error: 'Category not found or not yours' });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        userId: req.user.id,
        categoryId: categoryId || null,
        gpsrIdentificationDetails: gpsrIdentificationDetails || null,
        gpsrWarningPhrases: gpsrWarningPhrases || null,
        gpsrWarningText: gpsrWarningText || null,
        gpsrPictograms: gpsrPictograms || null,
        gpsrAdditionalSafetyInfo: gpsrAdditionalSafetyInfo || null,
        gpsrStatementOfCompliance: gpsrStatementOfCompliance || null,
        gpsrOnlineInstructionsUrl: gpsrOnlineInstructionsUrl || null,
        gpsrInstructionsManual: gpsrInstructionsManual || null,
        gpsrDeclarationsOfConformity: gpsrDeclarationsOfConformity || null,
        gpsrCertificates: gpsrCertificates || null,
        gpsrModerationStatus: gpsrModerationStatus || 'PENDING',
        gpsrModerationComment: gpsrModerationComment || null,
        gpsrSubmittedBySupplierUser: gpsrSubmittedBySupplierUser || null,
      },
      include: { category: true },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// UPDATE product
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const {
      name,
      categoryId,
      gpsrIdentificationDetails,
      gpsrWarningPhrases,
      gpsrWarningText,
      gpsrPictograms,
      gpsrAdditionalSafetyInfo,
      gpsrStatementOfCompliance,
      gpsrOnlineInstructionsUrl,
      gpsrInstructionsManual,
      gpsrDeclarationsOfConformity,
      gpsrCertificates,
      gpsrModerationStatus,
      gpsrModerationComment,
      gpsrSubmittedBySupplierUser,
    } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product || product.userId !== req.user.id) {
      return res.status(403).json({ error: 'Product not found or not yours' });
    }

    // Verify category belongs to user if provided
    if (categoryId && categoryId !== product.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category || category.userId !== req.user.id) {
        return res.status(403).json({ error: 'Category not found or not yours' });
      }
    }

    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name || product.name,
        categoryId: categoryId !== undefined ? categoryId : product.categoryId,
        gpsrIdentificationDetails: gpsrIdentificationDetails !== undefined ? gpsrIdentificationDetails : product.gpsrIdentificationDetails,
        gpsrWarningPhrases: gpsrWarningPhrases !== undefined ? gpsrWarningPhrases : product.gpsrWarningPhrases,
        gpsrWarningText: gpsrWarningText !== undefined ? gpsrWarningText : product.gpsrWarningText,
        gpsrPictograms: gpsrPictograms !== undefined ? gpsrPictograms : product.gpsrPictograms,
        gpsrAdditionalSafetyInfo: gpsrAdditionalSafetyInfo !== undefined ? gpsrAdditionalSafetyInfo : product.gpsrAdditionalSafetyInfo,
        gpsrStatementOfCompliance: gpsrStatementOfCompliance !== undefined ? gpsrStatementOfCompliance : product.gpsrStatementOfCompliance,
        gpsrOnlineInstructionsUrl: gpsrOnlineInstructionsUrl !== undefined ? gpsrOnlineInstructionsUrl : product.gpsrOnlineInstructionsUrl,
        gpsrInstructionsManual: gpsrInstructionsManual !== undefined ? gpsrInstructionsManual : product.gpsrInstructionsManual,
        gpsrDeclarationsOfConformity: gpsrDeclarationsOfConformity !== undefined ? gpsrDeclarationsOfConformity : product.gpsrDeclarationsOfConformity,
        gpsrCertificates: gpsrCertificates !== undefined ? gpsrCertificates : product.gpsrCertificates,
        gpsrModerationStatus: gpsrModerationStatus !== undefined ? gpsrModerationStatus : product.gpsrModerationStatus,
        gpsrModerationComment: gpsrModerationComment !== undefined ? gpsrModerationComment : product.gpsrModerationComment,
        gpsrSubmittedBySupplierUser: gpsrSubmittedBySupplierUser !== undefined ? gpsrSubmittedBySupplierUser : product.gpsrSubmittedBySupplierUser,
      },
      include: { category: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product || product.userId !== req.user.id) {
      return res.status(403).json({ error: 'Product not found or not yours' });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;


