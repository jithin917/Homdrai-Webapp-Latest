import { supabase } from '../lib/supabase';
import { CustomerMeasurements } from '../types/oms';
import { ApiResponse } from '../types/oms-api';

/**
 * Customer measurements service
 */
export const measurementsService = {
  /**
   * Creates new customer measurements
   * 
   * @param measurementData - The measurement data
   * @returns API response with the created measurements
   */
  create: async (measurementData: Omit<CustomerMeasurements, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<CustomerMeasurements>> => {
    try {
      const { data, error } = await supabase
        .from('oms_customer_measurements')
        .insert([{
          customer_id: measurementData.customerId,
          unit: measurementData.unit,
          top_fl: measurementData.top.FL,
          top_sh: measurementData.top.SH,
          top_sl: measurementData.top.SL,
          top_sr: measurementData.top.SR,
          top_mr: measurementData.top.MR,
          top_ah: measurementData.top.AH,
          top_ch: measurementData.top.CH,
          top_br: measurementData.top.BR,
          top_wr: measurementData.top.WR,
          top_hip: measurementData.top.HIP,
          top_slit: measurementData.top.SLIT,
          top_fn: measurementData.top.FN,
          top_bn: measurementData.top.BN,
          top_dp: measurementData.top.DP,
          top_pp: measurementData.top.PP,
          bottom_fl: measurementData.bottom?.FL,
          bottom_wr: measurementData.bottom?.WR,
          bottom_sr: measurementData.bottom?.SR,
          bottom_tr: measurementData.bottom?.TR,
          bottom_lr: measurementData.bottom?.LR,
          bottom_ar: measurementData.bottom?.AR,
          notes: measurementData.notes
        }])
        .select()
        .single();

      if (error) throw error;

      const measurements: CustomerMeasurements = {
        id: data.id,
        customerId: data.customer_id,
        unit: data.unit,
        top: {
          FL: data.top_fl,
          SH: data.top_sh,
          SL: data.top_sl,
          SR: data.top_sr,
          MR: data.top_mr,
          AH: data.top_ah,
          CH: data.top_ch,
          BR: data.top_br,
          WR: data.top_wr,
          HIP: data.top_hip,
          SLIT: data.top_slit,
          FN: data.top_fn,
          BN: data.top_bn,
          DP: data.top_dp,
          PP: data.top_pp
        },
        bottom: data.bottom_fl ? {
          FL: data.bottom_fl,
          WR: data.bottom_wr,
          SR: data.bottom_sr,
          TR: data.bottom_tr,
          LR: data.bottom_lr,
          AR: data.bottom_ar
        } : undefined,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      return { success: true, data: measurements };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create measurements' };
    }
  },

  /**
   * Gets measurements by customer ID
   * 
   * @param customerId - The customer ID
   * @returns API response with the customer's measurements
   */
  getByCustomerId: async (customerId: string): Promise<ApiResponse<CustomerMeasurements[]>> => {
    try {
      const { data, error } = await supabase
        .from('oms_customer_measurements')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const measurements: CustomerMeasurements[] = data.map(item => ({
        id: item.id,
        customerId: item.customer_id,
        unit: item.unit,
        top: {
          FL: item.top_fl,
          SH: item.top_sh,
          SL: item.top_sl,
          SR: item.top_sr,
          MR: item.top_mr,
          AH: item.top_ah,
          CH: item.top_ch,
          BR: item.top_br,
          WR: item.top_wr,
          HIP: item.top_hip,
          SLIT: item.top_slit,
          FN: item.top_fn,
          BN: item.top_bn,
          DP: item.top_dp,
          PP: item.top_pp
        },
        bottom: item.bottom_fl ? {
          FL: item.bottom_fl,
          WR: item.bottom_wr,
          SR: item.bottom_sr,
          TR: item.bottom_tr,
          LR: item.bottom_lr,
          AR: item.bottom_ar
        } : undefined,
        notes: item.notes,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      return { success: true, data: measurements };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to fetch measurements' };
    }
  }
};

/**
 * Gets measurements by customer ID (alias for backward compatibility)
 * 
 * @param customerId - The customer ID
 * @returns API response with the customer's measurements
 */
export const getMeasurementsByCustomerId = measurementsService.getByCustomerId;