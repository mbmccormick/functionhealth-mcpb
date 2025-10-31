/**
 * Response formatters for Function Health API
 *
 * Formats API responses into concise, readable summaries
 */

/**
 * Format biomarker results into a concise summary
 */
export function formatBiomarkers(data) {
  if (!data || !data.data || !data.data.biomarkerResultsRecord) {
    return data;
  }

  const biomarkers = data.data.biomarkerResultsRecord.map(record => {
    const biomarker = record.biomarker || {};
    const current = record.currentResult || {};

    // Get all historical results sorted by date (most recent first)
    const allResults = (record.biomarkerResults || [])
      .map(result => ({
        value: result.testResult,
        date: result.dateOfService,
        inRange: !result.testResultOutOfRange,
        requisitionId: result.requisitionId
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      name: biomarker.name,
      description: biomarker.oneLineDescription,
      category: biomarker.categories?.[0]?.categoryName,
      current: {
        value: current.displayResult,
        date: current.dateOfService,
        inRange: current.inRange
      },
      history: allResults,
      range: {
        min: record.rangeMinDisplay,
        max: record.rangeMaxDisplay,
        units: record.units
      },
      status: record.outOfRangeType,
      improving: record.improving,
      hasNewResults: record.hasNewResults
    };
  });

  // Group by category for better organization
  const byCategory = {};
  biomarkers.forEach(b => {
    const cat = b.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(b);
  });

  return {
    summary: {
      total: biomarkers.length,
      outOfRange: biomarkers.filter(b => !b.current.inRange).length,
      improving: biomarkers.filter(b => b.improving).length,
      hasNewResults: biomarkers.filter(b => b.hasNewResults).length
    },
    categories: byCategory
  };
}

/**
 * Format metrics into a concise summary
 */
export function formatMetrics(data) {
  if (!data || !data.data || !data.data.metrics) {
    return data;
  }

  const metrics = data.data.metrics.map(metric => {
    // Get last 7 days of data instead of all historical data
    const recentValues = metric.values?.daily?.slice(-7) || [];

    return {
      metric: metric.metric,
      device: metric.device?.name,
      category: metric.category,
      description: metric.short_description,
      current: metric.display_value,
      chartType: metric.chart_type,
      recentData: recentValues.map(v => ({
        date: v.date?.split('T')[0], // Just the date part
        value: v.value
      }))
    };
  });

  return {
    summary: {
      totalMetrics: metrics.length,
      devices: [...new Set(metrics.map(m => m.device).filter(Boolean))]
    },
    metrics: metrics
  };
}

/**
 * Format combined health data (biomarkers and metrics) into a unified summary
 */
export function formatHealthData(data) {
  if (!data || !data.biomarkers || !data.metrics) {
    return data;
  }

  // Format each section using existing formatters
  const formattedBiomarkers = formatBiomarkers(data.biomarkers);
  const formattedMetrics = formatMetrics(data.metrics);

  return {
    biomarkers: formattedBiomarkers,
    metrics: formattedMetrics
  };
}

/**
 * Format requisitions into a concise summary
 */
export function formatRequisitions(data) {
  if (!Array.isArray(data)) {
    return data;
  }

  const requisitions = data.map(req => {
    const reportTypes = {};
    req.urls?.forEach(urlObj => {
      const type = urlObj.url.split('/')[0]; // Extract type (RequestGroup or DiagnosticReport)
      if (!reportTypes[type]) reportTypes[type] = [];
      reportTypes[type].push({
        url: urlObj.url,
        created: urlObj.created_at
      });
    });

    return {
      date: req.date,
      reports: reportTypes,
      totalReports: req.urls?.length || 0
    };
  });

  return {
    summary: {
      totalRequisitions: requisitions.length,
      totalReports: requisitions.reduce((sum, r) => sum + r.totalReports, 0)
    },
    requisitions: requisitions
  };
}

/**
 * Format results into a concise summary
 */
export function formatResults(data) {
  if (!Array.isArray(data)) {
    return data;
  }

  const results = data.map(result => {
    const visits = result.visits?.map(visit => {
      const biomarkerSummary = {
        total: visit.biomarkerResults?.length || 0,
        outOfRange: visit.biomarkerResults?.filter(b => b.testResultOutOfRange).length || 0
      };

      return {
        visitDate: visit.visitDate,
        location: {
          address: visit.streetAddress,
          city: visit.city,
          state: visit.state,
          zip: visit.zip
        },
        confirmationCode: visit.confirmationCode,
        biomarkers: biomarkerSummary,
        biomarkerDetails: visit.biomarkerResults?.map(b => ({
          name: b.biomarkerName,
          result: b.testResult,
          units: b.measurementUnits,
          outOfRange: b.testResultOutOfRange,
          referenceRange: b.questReferenceRange,
          dateOfService: b.dateOfService
        }))
      };
    });

    return {
      id: result.id,
      reviewed: result.reviewed,
      dateReviewed: result.dateTimeReviewed,
      reviewingPhysician: result.reviewingPhysician ?
        `${result.reviewingPhysician.fname} ${result.reviewingPhysician.lname}` : null,
      patientNotes: result.patientNotes,
      physicianNotes: result.physicianNotes,
      visits: visits
    };
  });

  return {
    summary: {
      totalResults: results.length,
      reviewedResults: results.filter(r => r.reviewed).length,
      totalVisits: results.reduce((sum, r) => sum + (r.visits?.length || 0), 0)
    },
    results: results
  };
}
