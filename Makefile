#!/usr/bin/make -f

build-website:
	npm ci
	npm run build

build-ida-website: 
	echo "Use ida customisations"
	cp -rf ida-customisations/ ./
	echo "Build website"
	npm ci
	npm run build
	echo "Build completed"

# deploy-website is currently unused, deployment happens via github actions
deploy-website: build-website
	cd .vuepress/dist && \
	echo "role_arn = ${DEPLOYMENT_ROLE_ARN}" >> /root/.aws/config ; \
	echo "CI job = ${CIRCLE_BUILD_URL}" >> version.html ; \
	aws s3 sync . s3://"${WEBSITE_BUCKET}" --profile terraform --delete ; \
	aws cloudfront create-invalidation --distribution-id "${CF_DISTRIBUTION_ID}" --profile terraform --path "/*" ;

.PHONY: build-website deploy-website