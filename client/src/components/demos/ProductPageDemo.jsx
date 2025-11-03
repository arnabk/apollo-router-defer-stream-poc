import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import ComparisonView from '../ComparisonView';
import QueryPanel from '../QueryPanel';
import LoadingCard from '../LoadingCard';
import '../../styles/ProductPage.css';

const PRODUCT_QUERY_REGULAR = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      inventory {
        inStock
        quantity
        warehouse
      }
      reviews {
        id
        author
        rating
        text
        createdAt
      }
      recommendations {
        id
        name
        price
      }
    }
  }
`;

const PRODUCT_QUERY_DEFER = gql`
  query GetProductDefer($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      ... @defer {
        inventory {
          inStock
          quantity
          warehouse
        }
      }
      ... @defer {
        reviews {
          id
          author
          rating
          text
          createdAt
        }
      }
      ... @defer {
        recommendations {
          id
          name
          price
        }
      }
    }
  }
`;

function ProductCard({ product, loading }) {
  if (!product && !loading) return null;

  return (
    <div className="product-page">
      <div className="product-header">
        <div className="product-image-placeholder">
          📦
        </div>
        <div className="product-info">
          <h2>{product?.name || 'Loading...'}</h2>
          <p>{product?.description || 'Loading...'}</p>
          {product?.price && (
            <div className="product-price">${product.price.toFixed(2)}</div>
          )}
        </div>
      </div>

      {loading && !product?.inventory ? (
        <LoadingCard title="Inventory" />
      ) : product?.inventory ? (
        <div className="inventory-card">
          <h3>Availability</h3>
          <div className={`stock-status ${product.inventory.inStock ? 'in-stock' : 'out-of-stock'}`}>
            {product.inventory.inStock ? '✓ In Stock' : '✗ Out of Stock'}
          </div>
          <p>Quantity: {product.inventory.quantity}</p>
          <p>📍 {product.inventory.warehouse}</p>
        </div>
      ) : null}

      {loading && !product?.reviews ? (
        <LoadingCard title="Reviews" />
      ) : product?.reviews ? (
        <div className="reviews-card">
          <h3>Customer Reviews ({product.reviews.length})</h3>
          {product.reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet</p>
          ) : (
            product.reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="review-author">{review.author}</span>
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))
          )}
        </div>
      ) : null}

      {loading && !product?.recommendations ? (
        <LoadingCard title="Recommendations" />
      ) : product?.recommendations ? (
        <div className="recommendations-card">
          <h3>You might also like</h3>
          <div className="recommendations-grid">
            {product.recommendations.map((rec) => (
              <div key={rec.id} className="recommendation-item">
                <div className="recommendation-image">📦</div>
                <h4>{rec.name}</h4>
                <p className="recommendation-price">${rec.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductPageDemo() {
  const [regularData, setRegularData] = useState(null);
  const [deferData, setDeferData] = useState(null);

  const [fetchRegular, { loading: regularLoading }] = useLazyQuery(PRODUCT_QUERY_REGULAR, {
    fetchPolicy: 'network-only',
  });

  const [fetchDefer, { loading: deferLoading }] = useLazyQuery(PRODUCT_QUERY_DEFER, {
    fetchPolicy: 'network-only',
  });

  const executeRegular = ({ onFirstData, onComplete }) => {
    setRegularData(null);
    let firstDataReceived = false;

    fetchRegular({
      variables: { id: '1' },
      onCompleted: (data) => {
        setRegularData(data.product);
        if (!firstDataReceived) {
          onFirstData();
          firstDataReceived = true;
        }
        onComplete();
      },
    });
  };

  const executeDefer = ({ onFirstData, onComplete }) => {
    setDeferData(null);
    let firstDataReceived = false;
    let completeDataReceived = false;

    fetchDefer({
      variables: { id: '1' },
      onCompleted: (data) => {
        setDeferData(data.product);
        
        if (!firstDataReceived && data.product) {
          onFirstData();
          firstDataReceived = true;
        }

        if (data.product?.inventory && data.product?.reviews && data.product?.recommendations) {
          if (!completeDataReceived) {
            onComplete();
            completeDataReceived = true;
          }
        }
      },
    });
  };

  return (
    <ComparisonView title="Product Page Query Comparison">
      <QueryPanel
        title="Regular Query"
        type="regular"
        onExecute={executeRegular}
      >
        <ProductCard product={regularData} loading={regularLoading} />
      </QueryPanel>

      <QueryPanel
        title="Query with @defer"
        type="defer"
        onExecute={executeDefer}
      >
        <ProductCard product={deferData} loading={deferLoading} />
      </QueryPanel>
    </ComparisonView>
  );
}

export default ProductPageDemo;

