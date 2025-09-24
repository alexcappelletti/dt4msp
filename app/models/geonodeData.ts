export interface LayerParams {
    id: number
    thumbURL: string
    title: string
    type: string
    url: string
    singleTile: boolean
    dimensions: any[]
    hideLoading: boolean
    handleClickOnLayer: boolean
    useForElevation: boolean
    hidden: boolean
    extraParams: {
        msId: string
    }
    wrapDateLine: boolean
    displayOutsideMaxExtent: boolean
}

export class LayerDefinition {
    pk: number
    name: string
    store: string | null
    stackOrder: number
    format: string
    opacity: number
    styles: string
    transparent: boolean
    fixed: boolean
    group: string
    visibility: boolean
    owsUrl: string
    layerParams: LayerParams
    sourceParams: Record<string, unknown>
    local: boolean

    constructor(data: any) {
        this.pk = data.pk
        this.name = data.name
        this.store = data.store
        this.stackOrder = data.stack_order
        this.format = data.format
        this.opacity = data.opacity
        this.styles = data.styles
        this.transparent = data.transparent
        this.fixed = data.fixed
        this.group = data.group
        this.visibility = data.visibility
        this.owsUrl = data.ows_url
        this.layerParams = typeof data.layer_params === 'string'
            ? JSON.parse(data.layer_params)
            : data.layer_params
        this.sourceParams = typeof data.source_params === 'string'
            ? JSON.parse(data.source_params)
            : data.source_params

        this.local = data.local
    }

    getLayerId(): string {
        return this.layerParams.extraParams?.msId || this.name
    }

    getThumbnail(): string | null {
        return this.layerParams.thumbURL || null
    }

    isVisible(): boolean {
        return this.visibility && !this.layerParams.hidden
    }
}
