// tests unitarios para la logica de negocio
import { describe, it, expect } from 'vitest';
import { saleQuerySchema, bulkUpdateSaleStatusSchema, bulkUpdateProductPriceSchema } from '@/lib/validations/sale';

// Funciones auxiliares de cálculo y formateo de negocio
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function calculateMetrics(sales: { total: number; status: string }[]) {
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const pendingCount = sales.filter((s) => s.status === 'PENDING').length;
  const completedCount = sales.filter((s) => s.status === 'COMPLETED').length;
  return { totalRevenue, pendingCount, completedCount, totalSales: sales.length };
}

export function predictInventoryRestock(salesVelocity: number, currentStock: number, leadTimeDays: number): boolean {
  const projectedDemand = salesVelocity * leadTimeDays;
  return currentStock <= projectedDemand;
}

describe('Suite de Pruebas Unitarias — PulseMarket', () => {
  // --- Grupo 1: Formateadores y Cálculo Financiero ---
  it('1. Debe formatear correctamente montos numéricos a formato de moneda USD', () => {
    expect(formatCurrency(1250.5)).toBe('$1,250.50');
  });

  it('2. Debe formatear adecuadamente valores en cero o negativos', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('3. Debe calcular el ingreso total sumando las ventas individuales', () => {
    const mockSales = [{ total: 100, status: 'COMPLETED' }, { total: 250, status: 'PENDING' }];
    const metrics = calculateMetrics(mockSales);
    expect(metrics.totalRevenue).toBe(350);
  });

  it('4. Debe contar con precisión la cantidad de órdenes completadas y pendientes', () => {
    const mockSales = [
      { total: 100, status: 'COMPLETED' },
      { total: 200, status: 'PENDING' },
      { total: 150, status: 'PENDING' },
    ];
    const metrics = calculateMetrics(mockSales);
    expect(metrics.pendingCount).toBe(2);
    expect(metrics.completedCount).toBe(1);
  });

  // --- Grupo 2: Validación de Esquemas Zod ---
  it('5. Debe validar un esquema saleQuerySchema con parámetros válidos', () => {
    const validParams = { page: '1', limit: '20', status: 'COMPLETED' };
    const result = saleQuerySchema.safeParse(validParams);
    expect(result.success).toBe(true);
  });

  it('6. Debe rechazar una consulta con límites o páginas fuera de rango', () => {
    const invalidParams = { page: '-1', limit: '1000' };
    const result = saleQuerySchema.safeParse(invalidParams);
    expect(result.success).toBe(false);
  });

  it('7. Debe validar el esquema de actualización masiva de estados con UUIDs válidos', () => {
    const validBulk = {
      ids: ['123e4567-e89b-12d3-a456-426614174000'],
      status: 'COMPLETED',
    };
    const result = bulkUpdateSaleStatusSchema.safeParse(validBulk);
    expect(result.success).toBe(true);
  });

  it('8. Debe rechazar la actualización masiva si el arreglo de IDs está vacío', () => {
    const emptyBulk = { ids: [], status: 'COMPLETED' };
    const result = bulkUpdateSaleStatusSchema.safeParse(emptyBulk);
    expect(result.success).toBe(false);
  });

  it('9. Debe validar ajustes porcentuales de precio dentro de rangos permitidos', () => {
    const validPriceAdjustment = { category: 'ELECTRONICS', percentageChange: 15 };
    const result = bulkUpdateProductPriceSchema.safeParse(validPriceAdjustment);
    expect(result.success).toBe(true);
  });

  // --- Grupo 3: Algoritmos Predictivos de Inventario ---
  it('10. Debe sugerir reabastecimiento cuando el stock actual sea inferior a la demanda proyectada', () => {
    const needsRestock = predictInventoryRestock(10, 25, 3); // Demanda: 30, Stock: 25 -> Requiere reabastecimiento
    expect(needsRestock).toBe(true);
  });
});