import { prisma } from "../config/prisma.js";

import {
  getPagination,
  getPaginationMeta
} from "../utils/pagination.js";

import {
  successResponse,
  errorResponse
} from "../utils/response.js";


export const getAnalysisById = async (req, res) => {
  try {
    const analysisId = Number(req.params.id);

    if (Number.isNaN(analysisId)) {
      return errorResponse(res, "Invalid analysis ID", 400);
    }

    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        pullRequest: {
          include: { repository: true }
        },
        findings: {
          include: { changedFile: true },
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!analysis) {
      return errorResponse(res, "Analysis not found", 404);
    }

    const summary = {
      totalFindings: analysis.findings.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    analysis.findings.forEach((finding) => {
      if (finding.severity in summary) {
        summary[finding.severity]++;
      }
    });

    const findings = analysis.findings.map((finding) => ({
      id: finding.id,
      severity: finding.severity,
      category: finding.category,
      title: finding.title,
      file: finding.changedFile?.filename ?? null,
      line: finding.lineNumber,
      message: finding.message,
      suggestion: finding.suggestion
    }));

    return successResponse(res, {
      analysis: {
        id: analysis.id,
        status: analysis.status,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt
      },

      pullRequest: {
        number: analysis.pullRequest.number,
        title: analysis.pullRequest.title,
        author: analysis.pullRequest.author,
        repository: analysis.pullRequest.repository.fullName
      },

      summary,
      findings
    });

  } catch (error) {
    console.error("❌ Failed to fetch analysis:", error);

    return errorResponse(
      res,
      "Failed to fetch analysis",
      500
    );
  }
};


export const getAnalyses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          pullRequest: {
            include: { repository: true }
          },
          findings: true
        }
      }),

      prisma.analysis.count()
    ]);

    const data = analyses.map((analysis) => {
      const summary = {
        totalFindings: analysis.findings.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };

      analysis.findings.forEach((finding) => {
        if (finding.severity in summary) {
          summary[finding.severity]++;
        }
      });

      return {
        id: analysis.id,
        status: analysis.status,
        createdAt: analysis.createdAt,
        completedAt: analysis.completedAt,

        pullRequest: {
          number: analysis.pullRequest.number,
          title: analysis.pullRequest.title,
          author: analysis.pullRequest.author,
          repository: analysis.pullRequest.repository.fullName
        },

        summary
      };
    });

    return successResponse(res, {
      data,
      pagination: getPaginationMeta(page, limit, total)
    });

  } catch (error) {
    console.error("❌ Failed to fetch analyses:", error);

    return errorResponse(
      res,
      "Failed to fetch analyses",
      500
    );
  }
};