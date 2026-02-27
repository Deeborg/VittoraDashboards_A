import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Home,
  ChevronRight,
  Search,
  Filter,
  Download,
  ZoomIn,
  Layers,
  Receipt,
  Link as LinkIcon,
  FileText,
  ShoppingCart,
  Package,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { ArrowRight } from '@mui/icons-material';
import DrillDownTable from '../components/tables/DrillDownTable';
import { mockDrillDownData, mockDocumentDetails } from '../utils/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';

const DrillDown: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<'costCenter' | 'glAccount' | 'document'>('costCenter');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCostCenter, setSelectedCostCenter] = useState<string | null>(null);
  const [selectedGlAccount, setSelectedGlAccount] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showDocumentChain, setShowDocumentChain] = useState(false);

  const handleCostCenterClick = (costCenter: string) => {
    setSelectedCostCenter(costCenter);
    setSelectedLevel('glAccount');
    setSelectedGlAccount(null);
    setSelectedDocument(null);
  };

  const handleGlAccountClick = (glAccount: string) => {
    setSelectedGlAccount(glAccount);
    setSelectedLevel('document');
    setSelectedDocument(null);
  };

  const handleDocumentClick = (documentNo: string) => {
    setSelectedDocument(documentNo);
    setShowDocumentChain(true);
  };

  const handleBack = () => {
    if (selectedLevel === 'document') {
      setSelectedLevel('glAccount');
      setSelectedGlAccount(null);
      setSelectedDocument(null);
    } else if (selectedLevel === 'glAccount') {
      setSelectedLevel('costCenter');
      setSelectedCostCenter(null);
      setSelectedGlAccount(null);
      setSelectedDocument(null);
    }
  };

  const handleReset = () => {
    setSelectedLevel('costCenter');
    setSelectedCostCenter(null);
    setSelectedGlAccount(null);
    setSelectedDocument(null);
    setSearchTerm('');
  };

  const getBreadcrumbs = () => {
    const items: Array<{ label: string; level: 'costCenter' | 'glAccount' | 'document'; value?: string }> = [
      { label: 'Cost Centers', level: 'costCenter' },
    ];

    if (selectedCostCenter) {
      items.push({ label: selectedCostCenter, level: 'glAccount', value: selectedCostCenter });
    }

    if (selectedGlAccount) {
      items.push({ label: selectedGlAccount, level: 'document', value: selectedGlAccount });
    }

    if (selectedDocument) {
      items.push({ label: selectedDocument, level: 'document', value: selectedDocument });
    }

    return items;
  };

  const getPageTitle = () => {
    switch (selectedLevel) {
      case 'costCenter':
        return 'Cost Center Analysis';
      case 'glAccount':
        return `GL Accounts - ${selectedCostCenter}`;
      case 'document':
        return selectedDocument ? `Document Chain - ${selectedDocument}` : `Documents - ${selectedGlAccount}`;
      default:
        return 'Drill Down Analysis';
    }
  };

  const getStats = () => {
    let totalAmount = 0;
    let totalBudget = 0;
    let itemCount = 0;

    switch (selectedLevel) {
      case 'costCenter':
        mockDrillDownData.forEach(item => {
          totalAmount += item.amount;
          totalBudget += item.budget;
          itemCount++;
        });
        break;
      case 'glAccount':
        const costCenterData = mockDrillDownData.find(
          item => item.costCenter === selectedCostCenter
        );
        if (costCenterData?.children) {
          costCenterData.children.forEach(item => {
            totalAmount += item.amount;
            totalBudget += item.budget;
            itemCount++;
          });
        }
        break;
      case 'document':
        const documentData = mockDocumentDetails.filter(
          doc => !selectedGlAccount || doc.glAccount === selectedGlAccount
        );
        documentData.forEach(doc => {
          totalAmount += doc.amount;
          // Find budget for this document
          const glAccount = mockDrillDownData
            .flatMap(cc => cc.children || [])
            .find(gl => gl.glAccount === doc.glAccount);
          totalBudget += glAccount?.budget || 0;
          itemCount++;
        });
        break;
    }

    const variance = ((totalAmount - totalBudget) / totalBudget) * 100;

    return { totalAmount, totalBudget, variance, itemCount };
  };

  const stats = getStats();

  // Filter documents based on search
  const filteredDocuments = mockDocumentDetails.filter(doc => {
    if (selectedGlAccount && doc.glAccount !== selectedGlAccount) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.documentNo.toLowerCase().includes(searchLower) ||
        doc.vendor.toLowerCase().includes(searchLower) ||
        (doc.poNumber?.toLowerCase().includes(searchLower) || false) ||
        (doc.grnNumber?.toLowerCase().includes(searchLower) || false) ||
        (doc.invoiceNumber?.toLowerCase().includes(searchLower) || false)
      );
    }
    return true;
  });

  // Get selected document details
  const selectedDocDetails = selectedDocument 
    ? mockDocumentDetails.find(doc => doc.documentNo === selectedDocument)
    : null;

  // Get document chain for selected document
  const getDocumentChain = () => {
    if (!selectedDocDetails) return [];
    
    const chain = [];
    
    // PO
    if (selectedDocDetails.poNumber) {
      chain.push({
        type: 'PO',
        number: selectedDocDetails.poNumber,
        status: selectedDocDetails.status === 'Posted' ? 'Approved' : 
               selectedDocDetails.status === 'Pending' ? 'Pending' : 'Rejected',
        icon: <ShoppingCart size={20} />,
        color: '#2563eb',
      });
    }
    
    // GRN
    if (selectedDocDetails.grnNumber) {
      chain.push({
        type: 'GRN',
        number: selectedDocDetails.grnNumber,
        status: selectedDocDetails.status === 'Posted' ? 'Received' : 
               selectedDocDetails.status === 'Pending' ? 'Pending' : 'Rejected',
        icon: <Package size={20} />,
        color: '#059669',
      });
    }
    
    // Invoice
    if (selectedDocDetails.invoiceNumber) {
      chain.push({
        type: 'Invoice',
        number: selectedDocDetails.invoiceNumber,
        status: selectedDocDetails.status === 'Posted' ? 'Paid' : 
               selectedDocDetails.status === 'Pending' ? 'Pending' : 'Rejected',
        icon: <FileText size={20} />,
        color: '#7c3aed',
      });
    }
    
    // Document itself
    chain.push({
      type: 'Document',
      number: selectedDocDetails.documentNo,
      status: selectedDocDetails.status,
      icon: <FileText size={20} />,
      color: '#d97706',
    });
    
    return chain;
  };

  const documentChain = getDocumentChain();

  return (
    <Box sx={{ p: 3, backgroundColor: '#0a1929', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs
          separator={<ChevronRight size={16} />}
          aria-label="breadcrumb"
          sx={{ mb: 2, color: '#94a3b8' }}
        >
          <Link
            underline="hover"
            href="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              fontSize: '0.875rem',
              color: '#94a3b8',
              cursor: 'pointer',
              '&:hover': { color: '#ffffff' }
            }}
            onClick={(e) => {
              e.preventDefault();
              handleReset();
            }}
          >
            <Home size={16} />
            Dashboard
          </Link>
          {getBreadcrumbs().map((item, index) => (
            <Link
              key={index}
              underline="hover"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (index < getBreadcrumbs().length - 1) {
                  if (item.level === 'costCenter') {
                    handleReset();
                  } else if (item.level === 'glAccount') {
                    setSelectedLevel('costCenter');
                    setSelectedGlAccount(null);
                    setSelectedDocument(null);
                  } else if (item.level === 'document' && !selectedDocument) {
                    setSelectedLevel('glAccount');
                    setSelectedDocument(null);
                  }
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: index === getBreadcrumbs().length - 1 ? 600 : 400,
                fontSize: '0.875rem',
                cursor: 'pointer',
                color: index === getBreadcrumbs().length - 1 ? '#ffffff' : '#94a3b8',
                '&:hover': { color: '#ffffff' }
              }}
            >
              {item.level === 'costCenter' && <Layers size={16} />}
              {item.level === 'glAccount' && <Receipt size={16} />}
              {item.level === 'document' && <LinkIcon size={16} />}
              {item.label}
            </Link>
          ))}
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff' }}>
              {getPageTitle()}
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Drill-down analysis: Cost Center → GL Account → Document (PO → GRN → Invoice)
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Filter size={18} />}
              sx={{ 
                textTransform: 'none',
                borderColor: '#334155',
                color: '#ffffff',
                '&:hover': {
                  borderColor: '#475569',
                  backgroundColor: '#1e293b',
                }
              }}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<Download size={18} />}
              sx={{ 
                textTransform: 'none',
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' }
              }}
            >
              Export Report
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ 
            borderRadius: 2,
            backgroundColor: '#ffffff',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Layers size={20} color="#2563eb" />
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Total Amount
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000' }}>
                {formatCurrency(stats.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ 
            borderRadius: 2,
            backgroundColor: '#ffffff',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Receipt size={20} color="#059669" />
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Budget
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000' }}>
                {formatCurrency(stats.totalBudget)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ 
            borderRadius: 2,
            backgroundColor: '#ffffff',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LinkIcon size={20} color="#d97706" />
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Variance
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: stats.variance > 0 ? '#dc2626' : '#059669',
                  }}
                >
                  {stats.variance > 0 ? '+' : ''}{stats.variance.toFixed(1)}%
                </Typography>
                <Chip
                  label={stats.variance > 0 ? 'Over Budget' : 'Under Budget'}
                  size="small"
                  sx={{
                    backgroundColor: stats.variance > 0 ? '#fee2e2' : '#d1fae5',
                    color: stats.variance > 0 ? '#dc2626' : '#059669',
                    fontWeight: 600,
                    fontSize: '0.55rem',
                    height: 24
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ 
            borderRadius: 2,
            backgroundColor: '#ffffff',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FileText size={20} color="#7c3aed" />
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Total Items
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#000000' }}>
                {stats.itemCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Paper sx={{ 
        p: 2, 
        mb: 3,
        borderRadius: 2,
        backgroundColor: '#ffffff',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <TextField
            placeholder={`Search ${selectedLevel === 'document' ? 'documents' : selectedLevel === 'glAccount' ? 'GL accounts' : 'cost centers'}...`}
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction="row" spacing={1}>
            {selectedLevel !== 'costCenter' && (
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{ textTransform: 'none' }}
            >
              Reset
            </Button>
            {selectedLevel === 'document' && selectedDocument && (
              <Button
                variant="contained"
                startIcon={<ZoomIn size={18} />}
                onClick={() => setShowDocumentChain(true)}
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: '#2563eb',
                  '&:hover': { backgroundColor: '#1d4ed8' }
                }}
              >
                View Document Chain
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Main Content */}
      {selectedLevel === 'document' ? (
        <Paper sx={{ 
          p: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
              {selectedDocument ? `Document Details - ${selectedDocument}` : `Documents - ${selectedGlAccount}`}
            </Typography>
            <Typography variant="body2" sx={{ color: '#2563eb' }}>
              {filteredDocuments.length} documents found
            </Typography>
          </Box>
          <Box sx={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Document No</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Vendor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>PO/GRN/Invoice</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr 
                    key={doc.id} 
                    style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: selectedDocument === doc.documentNo ? '#f0f9ff' : 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleDocumentClick(doc.documentNo)}
                  >
                    <td style={{ padding: '12px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileText size={16} color="#2563eb" />
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#000000' }}>
                          {doc.documentNo}
                        </Typography>
                      </Box>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.875rem', color: '#1e293b' }}>{formatDate(doc.date)}</td>
                    <td style={{ padding: '12px', fontSize: '0.875rem', color: '#1e293b' }}>{doc.vendor}</td>
                    <td style={{ padding: '12px', fontWeight: 600, fontSize: '0.875rem', color: '#000000' }}>
                      {formatCurrency(doc.amount)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Stack spacing={0.5}>
                        {doc.poNumber && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ShoppingCart size={14} color="#2563eb" />
                            <Typography variant="caption" sx={{ color: '#475569' }}>PO: {doc.poNumber}</Typography>
                          </Box>
                        )}
                        {doc.grnNumber && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Package size={14} color="#059669" />
                            <Typography variant="caption" sx={{ color: '#475569' }}>GRN: {doc.grnNumber}</Typography>
                          </Box>
                        )}
                        {doc.invoiceNumber && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FileText size={14} color="#7c3aed" />
                            <Typography variant="caption" sx={{ color: '#475569' }}>INV: {doc.invoiceNumber}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Chip
                        label={doc.status}
                        size="small"
                        sx={{
                          backgroundColor: doc.status === 'Posted' ? '#d1fae5' : 
                                         doc.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                          color: doc.status === 'Posted' ? '#059669' : 
                                doc.status === 'Pending' ? '#d97706' : '#dc2626',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<Eye size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentClick(doc.documentNo);
                        }}
                        sx={{ 
                          textTransform: 'none',
                          fontSize: '0.75rem'
                        }}
                      >
                        View Chain
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ 
          p: 3,
          borderRadius: 2,
          backgroundColor: '#ffffff',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 3 }}>
            {selectedLevel === 'costCenter' ? 'Cost Centers' : `GL Accounts - ${selectedCostCenter}`}
          </Typography>
          <DrillDownTable
            data={
              selectedLevel === 'costCenter'
                ? mockDrillDownData
                : mockDrillDownData
                    .find(item => item.costCenter === selectedCostCenter)
                    ?.children || []
            }
            onCostCenterClick={handleCostCenterClick}
            onGlAccountClick={handleGlAccountClick}
            selectedLevel={selectedLevel}
          />
        </Paper>
      )}

      {/* Document Chain Dialog */}
      <Dialog
        open={showDocumentChain}
        onClose={() => setShowDocumentChain(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', pb: 2, backgroundColor: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LinkIcon size={24} color="#2563eb" />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000' }}>
              Document Chain Analysis
            </Typography>
          </Box>
          {selectedDocDetails && (
            <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
              {selectedDocDetails.vendor} • {formatCurrency(selectedDocDetails.amount)}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, backgroundColor: '#ffffff' }}>
          {selectedDocDetails && (
            <>
              {/* Document Details */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#2563eb', mb: 1, fontWeight: 600 }}>
                      Document Information
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Document No:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>{selectedDocDetails.documentNo}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Date:</Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>{formatDate(selectedDocDetails.date)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Vendor:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#000000' }}>{selectedDocDetails.vendor}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>GL Account:</Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>{selectedDocDetails.glAccount}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Cost Center:</Typography>
                        <Typography variant="body2" sx={{ color: '#1e293b' }}>{selectedDocDetails.costCenter}</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#059669', mb: 1, fontWeight: 600 }}>
                      Financial Details
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Amount:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#000000' }}>
                          {formatCurrency(selectedDocDetails.amount)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>Status:</Typography>
                        <Chip
                          label={selectedDocDetails.status}
                          size="small"
                          sx={{
                            backgroundColor: selectedDocDetails.status === 'Posted' ? '#d1fae5' : 
                                           selectedDocDetails.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                            color: selectedDocDetails.status === 'Posted' ? '#059669' : 
                                  selectedDocDetails.status === 'Pending' ? '#d97706' : '#dc2626',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* Document Chain Visualization */}
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 3 }}>
                Document Flow: PO → GRN → Invoice → Posting
              </Typography>
              
              <Box sx={{ position: 'relative', py: 3, px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                  {documentChain.map((step, index) => (
                    <React.Fragment key={index}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
                        <Avatar
                          sx={{
                            bgcolor: step.color,
                            width: 48,
                            height: 48,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            mb: 1,
                          }}
                        >
                          {step.icon}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#000000' }}>
                          {step.type}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', textAlign: 'center' }}>
                          {step.number}
                        </Typography>
                        <Chip
                          label={step.status}
                          size="small"
                          sx={{
                            mt: 1,
                            backgroundColor: step.status === 'Approved' || step.status === 'Received' || step.status === 'Paid' || step.status === 'Posted' ? '#d1fae5' : '#fef3c7',
                            color: step.status === 'Approved' || step.status === 'Received' || step.status === 'Paid' || step.status === 'Posted' ? '#059669' : '#d97706',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </Box>
                      {index < documentChain.length - 1 && (
                        <Box sx={{ mx: 1 }}>
                          <ArrowRight sx={{ color: '#94a3b8', fontSize: 20 }} />
                        </Box>
                      )}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Status Legend */}
              <Paper sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#2563eb', mb: 2, fontWeight: 600 }}>
                  Status Legend
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle size={16} color="#059669" />
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>Posted/Approved</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={16} color="#d97706" />
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>Pending</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AlertCircle size={16} color="#dc2626" />
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>Rejected</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <Button
            onClick={() => setShowDocumentChain(false)}
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            sx={{ 
              textTransform: 'none', 
              backgroundColor: '#2563eb',
              '&:hover': { backgroundColor: '#1d4ed8' }
            }}
          >
            Export Chain
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Section */}
      <Paper sx={{ 
        p: 3, 
        mt: 3, 
        backgroundColor: '#ffffff',
        borderRadius: 2,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#000000', mb: 2 }}>
          Drill-Down Analysis Flow
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mb: 3, fontSize: '0.875rem' }}>
          This drill-down analysis allows you to trace expenses from Cost Centers down to individual documents.
          The complete flow is: <strong style={{ color: '#000000' }}>Cost Center → GL Account → Document Posting → PO → GRN → Invoice</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<Layers size={14} />}
            label="Cost Centers"
            variant={selectedLevel === 'costCenter' ? 'filled' : 'outlined'}
            sx={{
              backgroundColor: selectedLevel === 'costCenter' ? '#dbeafe' : 'transparent',
              color: selectedLevel === 'costCenter' ? '#2563eb' : '#475569',
              borderColor: '#cbd5e1',
              '& .MuiChip-icon': {
                color: selectedLevel === 'costCenter' ? '#2563eb' : '#475569',
              }
            }}
          />
          <Chip
            icon={<Receipt size={14} />}
            label="GL Accounts"
            variant={selectedLevel === 'glAccount' ? 'filled' : 'outlined'}
            sx={{
              backgroundColor: selectedLevel === 'glAccount' ? '#d1fae5' : 'transparent',
              color: selectedLevel === 'glAccount' ? '#059669' : '#475569',
              borderColor: '#cbd5e1',
              '& .MuiChip-icon': {
                color: selectedLevel === 'glAccount' ? '#059669' : '#475569',
              }
            }}
          />
          <Chip
            icon={<LinkIcon size={14} />}
            label="Document Chain"
            variant={selectedLevel === 'document' ? 'filled' : 'outlined'}
            sx={{
              backgroundColor: selectedLevel === 'document' ? '#fef3c7' : 'transparent',
              color: selectedLevel === 'document' ? '#d97706' : '#475569',
              borderColor: '#cbd5e1',
              '& .MuiChip-icon': {
                color: selectedLevel === 'document' ? '#d97706' : '#475569',
              }
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DrillDown;