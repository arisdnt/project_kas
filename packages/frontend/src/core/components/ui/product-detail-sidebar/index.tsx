import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarDescription,
  SidebarFooter,
} from "../sidebar"
import { cn } from "../../../lib/utils";
import { ProductDetailSidebarProps } from './types'
import { ProductDetailContent } from './layouts/ProductDetailContent'
import { ProductDetailFooter } from './layouts/ProductDetailFooter'

export const ProductDetailSidebar = React.forwardRef<
  HTMLDivElement,
  ProductDetailSidebarProps
>(({ product, open, onOpenChange, onEdit, className }, ref) => {
  if (!product) return null

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Sidebar open={open} onOpenChange={onOpenChange}>
      <SidebarContent size="fifty" className={cn("w-full", className)} ref={ref}>
        <SidebarHeader>
          <SidebarTitle>Detail Produk</SidebarTitle>
          <SidebarDescription>
            Informasi lengkap produk {product.nama}
          </SidebarDescription>
        </SidebarHeader>

        <ProductDetailContent product={product} />

        <SidebarFooter>
          <ProductDetailFooter
            product={product}
            onClose={handleClose}
            onEdit={onEdit}
          />
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
})

ProductDetailSidebar.displayName = "ProductDetailSidebar"

// Re-export types
export type { Product, ProductDetailSidebarProps } from './types'