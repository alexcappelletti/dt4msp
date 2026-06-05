import { DOMParser } from 'xmldom';

export interface OwsCapabilitiesOperation {
	name: string;
	methods: string[];
	formats: string[];
}

export interface OwsCapabilitiesItem {
	name: string;
	title: string;
	abstract: string;
	keywords: string[];
	crs: string[];
	boundingBoxes: Array<{
		crs: string;
		lowerCorner?: string;
		upperCorner?: string;
		minx?: string;
		miny?: string;
		maxx?: string;
		maxy?: string;
	}>;
}

export interface ParsedOwsCapabilities {
	serviceType: string;
	version: string;
	service: {
		name: string;
		title: string;
		abstract: string;
		keywords: string[];
	};
	operations: OwsCapabilitiesOperation[];
	items: OwsCapabilitiesItem[];
}

function getNodeName(node: Node): string {
	return ((node as Element).localName || node.nodeName || '').toLowerCase();
}

function isElementNode(node: Node): node is Element {
	return node.nodeType === 1;
}

function childElements(parent: Node): Element[] {
	const children: Element[] = [];
	for (let i = 0; i < parent.childNodes.length; i++) {
		const child = parent.childNodes[i];
		if (isElementNode(child)) {
			children.push(child);
		}
	}
	return children;
}

function findChildrenByLocalName(parent: Node, localName: string): Element[] {
	return childElements(parent).filter((child) => getNodeName(child) === localName.toLowerCase());
}

function findFirstChildByLocalName(parent: Node, localName: string): Element | null {
	return findChildrenByLocalName(parent, localName)[0] ?? null;
}

function findDescendantsByLocalName(parent: Node, localName: string): Element[] {
	const matches: Element[] = [];
	const targetName = localName.toLowerCase();

	function visit(node: Node) {
		for (const child of childElements(node)) {
			if (getNodeName(child) === targetName) {
				matches.push(child);
			}

			visit(child);
		}
	}

	visit(parent);
	return matches;
}

function getTextFromNode(node: Node | null): string {
	return node?.textContent?.trim() ?? '';
}

function getFirstChildText(parent: Node, localName: string): string {
	return getTextFromNode(findFirstChildByLocalName(parent, localName));
}

function getFirstDescendantText(parent: Node, localName: string): string {
	return getTextFromNode(findDescendantsByLocalName(parent, localName)[0] ?? null);
}

function collectKeywordTexts(parent: Node | null): string[] {
	if (!parent) {
		return [];
	}

	const containers = [
		...findChildrenByLocalName(parent, 'keywordlist'),
		...findChildrenByLocalName(parent, 'keywords'),
	];

	const values = new Set<string>();

	for (const container of containers) {
		for (const child of childElements(container)) {
			const childName = getNodeName(child);
			if (childName === 'keyword' || childName === 'value') {
				const text = getTextFromNode(child);
				if (text) values.add(text);
			}
		}
	}

	return [...values];
}

function collectOperationFormats(operationNode: Element): string[] {
	const formats = new Set<string>();

	for (const formatNode of findChildrenByLocalName(operationNode, 'format')) {
		const value = getTextFromNode(formatNode);
		if (value) formats.add(value);
	}

	for (const parameterNode of findChildrenByLocalName(operationNode, 'parameter')) {
		const parameterName =
			parameterNode.getAttribute('name')?.toLowerCase() ||
			parameterNode.getAttribute('Name')?.toLowerCase() ||
			'';

		if (parameterName !== 'outputformat') {
			continue;
		}

		for (const valueNode of findChildrenByLocalName(parameterNode, 'value')) {
			const value = getTextFromNode(valueNode);
			if (value) formats.add(value);
		}
	}

	return [...formats];
}

function collectOperationMethods(operationNode: Element): string[] {
	const methods = new Set<string>();

	for (const httpNode of findChildrenByLocalName(operationNode, 'http')) {
		for (const methodNode of childElements(httpNode)) {
			const name = getNodeName(methodNode).toUpperCase();
			if (name === 'GET' || name === 'POST') {
				methods.add(name);
			}
		}
	}

	for (const dcpTypeNode of findChildrenByLocalName(operationNode, 'dcptype')) {
		for (const httpNode of findChildrenByLocalName(dcpTypeNode, 'http')) {
			for (const methodNode of childElements(httpNode)) {
				const name = getNodeName(methodNode).toUpperCase();
				if (name === 'GET' || name === 'POST') {
					methods.add(name);
				}
			}
		}
	}

	return [...methods];
}

function parseOperations(root: Element): OwsCapabilitiesOperation[] {
	const operations: OwsCapabilitiesOperation[] = [];

	const operationsMetadata = findFirstChildByLocalName(root, 'operationsmetadata');
	if (operationsMetadata) {
		for (const operationNode of findChildrenByLocalName(operationsMetadata, 'operation')) {
			operations.push({
				name: operationNode.getAttribute('name') || operationNode.getAttribute('Name') || '',
				methods: collectOperationMethods(operationNode),
				formats: collectOperationFormats(operationNode),
			});
		}
	}

	const capabilityNode = findFirstChildByLocalName(root, 'capability');
	const requestNode = capabilityNode ? findFirstChildByLocalName(capabilityNode, 'request') : null;
	if (requestNode) {
		for (const operationNode of childElements(requestNode)) {
			operations.push({
				name: operationNode.nodeName,
				methods: collectOperationMethods(operationNode),
				formats: collectOperationFormats(operationNode),
			});
		}
	}

	return operations.filter((operation) => operation.name);
}

function collectCrsValues(node: Element): string[] {
	const values = new Set<string>();
	for (const child of childElements(node)) {
		const childName = getNodeName(child);
		if (childName === 'crs' || childName === 'srs' || childName === 'defaultcrs' || childName === 'othercrs') {
			const value = getTextFromNode(child);
			if (value) values.add(value);
		}
	}
	return [...values];
}

function collectBoundingBoxes(node: Element) {
	const boxes: OwsCapabilitiesItem['boundingBoxes'] = [];

	for (const bboxNode of findChildrenByLocalName(node, 'boundingbox')) {
		boxes.push({
			crs:
				bboxNode.getAttribute('CRS') ||
				bboxNode.getAttribute('SRS') ||
				bboxNode.getAttribute('crs') ||
				bboxNode.getAttribute('srs') ||
				'',
			minx: bboxNode.getAttribute('minx') || undefined,
			miny: bboxNode.getAttribute('miny') || undefined,
			maxx: bboxNode.getAttribute('maxx') || undefined,
			maxy: bboxNode.getAttribute('maxy') || undefined,
		});
	}

	for (const bboxNode of findChildrenByLocalName(node, 'wgs84boundingbox')) {
		boxes.push({
			crs: 'EPSG:4326',
			lowerCorner: getFirstChildText(bboxNode, 'lowercorner') || undefined,
			upperCorner: getFirstChildText(bboxNode, 'uppercorner') || undefined,
		});
	}

	return boxes;
}

function parseWmsLayers(layerNode: Element, items: OwsCapabilitiesItem[]) {
	const name = getFirstChildText(layerNode, 'name');
	const title = getFirstChildText(layerNode, 'title');
	const abstract = getFirstChildText(layerNode, 'abstract');

	if (name || title) {
		items.push({
			name,
			title,
			abstract,
			keywords: collectKeywordTexts(layerNode),
			crs: collectCrsValues(layerNode),
			boundingBoxes: collectBoundingBoxes(layerNode),
		});
	}

	for (const childLayer of findChildrenByLocalName(layerNode, 'layer')) {
		parseWmsLayers(childLayer, items);
	}
}

function parseWmsItems(root: Element): OwsCapabilitiesItem[] {
	const items: OwsCapabilitiesItem[] = [];
	const capabilityNode = findFirstChildByLocalName(root, 'capability');
	const layerNode =
		(capabilityNode ? findFirstChildByLocalName(capabilityNode, 'layer') : null) ??
		findDescendantsByLocalName(root, 'layer')[0] ??
		null;

	if (layerNode) {
		parseWmsLayers(layerNode, items);
	}

	return items.filter((item) => item.name || item.title);
}

function parseWfsItems(root: Element): OwsCapabilitiesItem[] {
	const featureTypeNodes = findDescendantsByLocalName(root, 'featuretype');

	return featureTypeNodes.map((featureTypeNode) => ({
		name: getFirstChildText(featureTypeNode, 'name') || getFirstDescendantText(featureTypeNode, 'name'),
		title: getFirstChildText(featureTypeNode, 'title') || getFirstDescendantText(featureTypeNode, 'title'),
		abstract: getFirstChildText(featureTypeNode, 'abstract') || getFirstDescendantText(featureTypeNode, 'abstract'),
		keywords: collectKeywordTexts(featureTypeNode),
		crs: collectCrsValues(featureTypeNode),
		boundingBoxes: collectBoundingBoxes(featureTypeNode),
	})).filter((item) => item.name || item.title);
}

function inferServiceType(root: Element): string {
	const rootName = root.nodeName.toLowerCase();
	if (rootName.includes('wms')) return 'WMS';
	if (rootName.includes('wfs')) return 'WFS';
	if (rootName.includes('wcs')) return 'WCS';

	const serviceType = getFirstChildText(root, 'servicetype') || getFirstChildText(root, 'name');
	return serviceType.toUpperCase() || 'UNKNOWN';
}

export function parseOwsCapabilities(xml: string): ParsedOwsCapabilities {
	const parser = new DOMParser();
	const document = parser.parseFromString(xml, 'text/xml');

	const errorNodes = document.getElementsByTagName('parsererror');
	if (errorNodes.length > 0) {
		throw new Error(errorNodes[0].textContent || 'Errore di parsing XML');
	}

	const root = document.documentElement;
	const serviceNode = findFirstChildByLocalName(root, 'service');
	const serviceType = inferServiceType(root);

	return {
		serviceType,
		version: root.getAttribute('version') || '',
		service: {
			name: serviceNode ? getFirstChildText(serviceNode, 'name') : '',
			title: serviceNode ? getFirstChildText(serviceNode, 'title') : '',
			abstract: serviceNode ? getFirstChildText(serviceNode, 'abstract') : '',
			keywords: collectKeywordTexts(serviceNode),
		},
		operations: parseOperations(root),
		items:
			serviceType === 'WFS'
				? parseWfsItems(root)
				: serviceType === 'WMS'
					? parseWmsItems(root)
					: [...parseWfsItems(root), ...parseWmsItems(root)],
	};
}
