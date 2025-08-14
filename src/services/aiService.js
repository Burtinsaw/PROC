import axios from '../utils/axios';

// AI-assisted product extraction service
// Normalizes backend response to { success, products, meta?, raw? }

async function extractProductsFromFiles(files, opts = {}) {
	const { targetLanguage = 'tr' } = opts;
	const form = new FormData();
	const list = Array.isArray(files) ? files : [files].filter(Boolean);
	if (!list.length) return { success: false, products: [], error: 'No files' };
	for (const f of list) form.append('files', f, f.name || 'upload');
	// targetLanguage is optional for future server-side translation hints
	form.append('targetLanguage', targetLanguage);
	try {
		const { data } = await axios.post('/ai/extract-products', form, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		// Backend shape: { success, count, results: [ { status, result:{ aiAnalysis:{ results:{ productExtraction:{ success, products, meta }}}}} ] }
		const first = data?.results?.[0];
		const extraction = first?.result?.aiAnalysis?.results?.productExtraction;
		const products = Array.isArray(extraction?.products) ? extraction.products : [];
		return {
			success: Boolean(extraction?.success) && products.length > 0,
			products,
			meta: extraction?.meta,
			raw: data
		};
	} catch (e) {
		return { success: false, products: [], error: e?.response?.data?.message || e.message };
	}
}

// Back-compat for RequestForm: expects aiService.default.processFileWithGemini(file, targetLanguage)
async function processFileWithGemini(file, targetLanguage = 'tr') {
	return extractProductsFromFiles(file, { targetLanguage });
}

export default { processFileWithGemini, extractProductsFromFiles };

// Suggest suppliers using backend AI endpoint
export async function suggestSuppliers(params = {}) {
	try {
		const { data } = await axios.post('/ai/suggest-suppliers', params);
		const list = Array.isArray(data?.suppliers) ? data.suppliers : [];
		return { success: true, suppliers: list, count: list.length };
	} catch (e) {
		return { success: false, suppliers: [], error: e?.response?.data?.message || e.message };
	}
}

// keep default export shape backward compatible while also named-exporting
export const aiService = { processFileWithGemini, extractProductsFromFiles, suggestSuppliers };

